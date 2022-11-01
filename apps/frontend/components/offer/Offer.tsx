import { Button, Flex, Td, Tr, Skeleton, Text, Divider } from '@chakra-ui/react';
import { BigNumber, ethers } from 'ethers';
import { ArrowBackIcon, ArrowForwardIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { useOfferData } from '../../utils/hooks/useOfferData';
import OfferSide from './OfferSide';
import { useOfferCancel } from '../../utils/hooks/useOfferCancel';

function Offer({
  orderId,
  isOwner = false,
  refetchBalanceOf,
}: {
  orderId: BigNumber;
  isOwner?: boolean;
  refetchBalanceOf?: () => void;
}) {
  const router = useRouter();

  const {
    owner,
    order,
    isLoading,
    offeredTokenName,
    offeredTokenSymbol,
    offeredTokenDecimals,
    wantedTokenName,
    wantedTokenSymbol,
    wantedTokenDecimals,
  } = useOfferData(orderId);

  const { cancelOffer, cancelOfferStatus } = useOfferCancel({
    orderId,
    isOwner,
    refetchBalanceOf,
  });

  if (isLoading || !order) {
    return (
      <Tr>
        <Td px={0} colSpan={5}>
          <Skeleton h={16} />
        </Td>
      </Tr>
    );
  }

  return (
    <>
      <Tr>
        <Td px={0} textAlign="center" w="min-content">
          {orderId.toNumber()}
        </Td>
        <Td px={0}>
          <OfferSide
            tokenName={offeredTokenName!}
            tokenSymbol={offeredTokenSymbol!}
            tokenAddress={order.offeredToken}
            amount={order.amountOffered}
            decimals={offeredTokenDecimals!}
          />
        </Td>
        <Td px={0}>
          <Flex justify="center" align="center" direction="column">
            <ArrowForwardIcon w={10} h={10} mb={-6} transform="auto" translateX="8px" />
            <ArrowBackIcon w={10} h={10} transform="auto" translateX="-8px" />
          </Flex>
        </Td>
        <Td px={0}>
          <OfferSide
            tokenName={wantedTokenName!}
            tokenSymbol={wantedTokenSymbol!}
            tokenAddress={order.wantedToken}
            amount={order.amountWanted}
            decimals={wantedTokenDecimals!}
          />
        </Td>
        <Td px={0}>
          <Flex justify="center">
            {isOwner ? (
              <Button
                onClick={() => cancelOffer?.()}
                colorScheme="pink"
                isLoading={cancelOfferStatus === 'loading'}
              >
                <CloseIcon />
              </Button>
            ) : (
              <Button onClick={() => router.push(`/offer/${orderId}`)} colorScheme="pink">
                <CheckIcon />
              </Button>
            )}
          </Flex>
        </Td>
      </Tr>
      <Tr>
        <Td colSpan={5}>
          <Text align="center">
            {!isOwner && (
              <>
                Creator: {owner}
                <br />{' '}
              </>
            )}
            Filable by{' '}
            {order.recipient === ethers.constants.AddressZero
              ? 'anyone'
              : order.recipient}
          </Text>
        </Td>
      </Tr>
      <Divider mb={2} />
    </>
  );
}

export default Offer;
