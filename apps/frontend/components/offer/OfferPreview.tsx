import { Button, Flex, SimpleGrid, Skeleton, Text } from '@chakra-ui/react';
import { BigNumber, ethers } from 'ethers';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import { getMilkyMarketContractAddresses } from '../../utils/getMilkyMarketContractAddresses';
import { useAllowance } from '../../utils/hooks/useAllowance';
import { useApproveToken } from '../../utils/hooks/useApproveToken';
import { useChainId } from '../../utils/hooks/useChainId';
import { useFillOrder } from '../../utils/hooks/useFillOrder';
import { useOfferCancel } from '../../utils/hooks/useOfferCancel';
import { useOfferData } from '../../utils/hooks/useOfferData';
import { useTokenBalanceOfUser } from '../../utils/hooks/useTokenBalanceOfUser';
import OfferSide from './OfferSide';

function OfferPreview({ orderId }: { orderId: number }) {
  const {
    doesOrderExist,
    order,
    owner,
    isLoading,
    offeredTokenName,
    offeredTokenSymbol,
    offeredTokenDecimals,
    wantedTokenName,
    wantedTokenSymbol,
    wantedTokenDecimals,
  } = useOfferData(BigNumber.from(orderId));
  const router = useRouter();
  const account = useAccount();
  const chainId = useChainId();
  const { allowance, refetch: refetchAllowance } = useAllowance({
    tokenAddress: order?.wantedToken,
    spenderAddress: getMilkyMarketContractAddresses(chainId).milkyMarket,
  });

  const isEnoughAllowance = !!allowance?.gte(order?.amountWanted || 0);

  const { approveToken, approveStatus } = useApproveToken({
    tokenAddress: order?.wantedToken,
    amount: order?.amountWanted,
    onSuccess: () => refetchAllowance(),
  });

  const { fillOrder, fillOrderStatus } = useFillOrder({
    orderId: BigNumber.from(orderId),
    isEnoughAllowance,
    onSuccess: () => {
      router.push('/');
    },
  });

  const { cancelOffer } = useOfferCancel({
    isOwner: account.address === owner,
    orderId: BigNumber.from(orderId),
    onSuccess: () => {
      router.push('/');
    },
  });

  const { data: balanceOfOfferedToken, status: balanceOfOfferedTokenStatus } =
    useTokenBalanceOfUser({
      address: order?.offeredToken,
    });
  const { data: balanceOfWantedToken, status: balanceOfWantedTokenStatus } =
    useTokenBalanceOfUser({
      address: order?.wantedToken,
    });

  const isEnoughBalance = balanceOfWantedToken?.lte(order?.amountWanted || 0) ?? false;

  if (isLoading || !order) {
    return <Skeleton h={16} />;
  }

  if (!doesOrderExist) {
    return (
      <Text mt={10} textAlign="center">
        Order not found
      </Text>
    );
  }

  const formattedWantedTokenAmount = `${ethers.utils.formatUnits(
    order.amountWanted,
    wantedTokenDecimals,
  )} ${wantedTokenName}`;
  const formattedOfferedTokenAmount = `${ethers.utils.formatUnits(
    order.amountOffered,
    offeredTokenDecimals,
  )} ${offeredTokenSymbol}`;

  return (
    <Flex direction="column" justifyContent="center">
      <Text fontWeight="bold" mt={10} align="center">
        {`You'll supply ${formattedWantedTokenAmount} and get ${formattedOfferedTokenAmount}`}
      </Text>
      {owner && <Text align="center">{`Created by: ${owner}`}</Text>}
      <Text align="center">{`Fillable by: ${
        order?.recipient === ethers.constants.AddressZero ? 'Anyone' : order?.recipient
      }`}</Text>
      {owner === account.address && (
        <Flex justify="center" my={2}>
          You are the owner of this order so you can cancel it{' '}
          <Text
            ml={1}
            color="pink.400"
            cursor="pointer"
            _hover={{
              textDecoration: 'underline',
              fontWeight: 'bold',
            }}
            onClick={() => cancelOffer?.()}
          >
            here
          </Text>
        </Flex>
      )}
      <SimpleGrid mt={10} columns={[1, 2]} spacing={2}>
        <Flex direction="column">
          <OfferSide
            tokenName={wantedTokenName!}
            tokenSymbol={wantedTokenSymbol!}
            tokenAddress={order.wantedToken}
            amount={order.amountWanted}
            decimals={wantedTokenDecimals!}
          />
          <Skeleton isLoaded={balanceOfWantedTokenStatus !== 'loading'}>
            <Text align="center" mt={2}>
              {`Balance: ${ethers.utils.formatUnits(
                balanceOfWantedToken || 0,
                wantedTokenDecimals,
              )} ${wantedTokenSymbol}`}
            </Text>
          </Skeleton>
          <Button
            disabled={!approveToken || isEnoughAllowance || isEnoughBalance}
            isLoading={approveStatus === 'loading'}
            colorScheme="blue"
            mt={2}
            onClick={() => approveToken?.()}
          >
            {isEnoughAllowance
              ? 'Approved MilkyMarket to use tokens'
              : `Approve ${wantedTokenSymbol}`}
          </Button>
          {isEnoughBalance && balanceOfWantedTokenStatus !== 'loading' && (
            <Text color="red" align="center">
              {`You don't have enough balance of ${wantedTokenSymbol} to accept this offer`}
            </Text>
          )}
        </Flex>
        <Flex direction="column">
          <OfferSide
            tokenName={offeredTokenName!}
            tokenSymbol={offeredTokenSymbol!}
            tokenAddress={order.offeredToken}
            amount={order.amountOffered}
            decimals={offeredTokenDecimals!}
          />
          <Skeleton isLoaded={balanceOfOfferedTokenStatus !== 'loading'}>
            <Text align="center" mt={2}>
              {`Balance: ${ethers.utils.formatUnits(
                balanceOfOfferedToken || 0,
                offeredTokenDecimals,
              )} ${offeredTokenSymbol}`}
            </Text>
          </Skeleton>
          <Button
            disabled={!fillOrder}
            onClick={() => fillOrder?.()}
            isLoading={fillOrderStatus === 'loading'}
            colorScheme="pink"
            mt={2}
          >
            {isEnoughAllowance
              ? `Exchange ${formattedWantedTokenAmount} for ${formattedOfferedTokenAmount}`
              : 'Waiting for token approval'}
          </Button>
        </Flex>
      </SimpleGrid>
      {order.recipient !== ethers.constants.AddressZero &&
        account.address !== order.recipient && (
          <Text mt={10} align="center" color="red" fontWeight="bold">
            {`You can't fill this order because you are not the recipient`}
          </Text>
        )}
    </Flex>
  );
}

export default OfferPreview;
