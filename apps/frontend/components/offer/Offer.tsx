import {
  Button,
  Flex,
  Td,
  Tr,
  Skeleton,
  Text,
  Divider,
  useMediaQuery,
} from '@chakra-ui/react';
import { BigNumber, ethers } from 'ethers';
import {
  ArrowBackIcon,
  ArrowForwardIcon,
  CheckIcon,
  CloseIcon,
  ExternalLinkIcon,
} from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { useOfferData } from '../../utils/hooks/useOfferData';
import OfferSide from './OfferSide';
import { useOfferCancel } from '../../utils/hooks/useOfferCancel';
import { shortenAddress } from '../../utils/shortenAddress';
import { useBlockchainExplorerLinkGenerator } from '../../utils/hooks/useBlockchainExplorerLinkGenerator';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useAtom } from 'jotai';
import {
  offeredTokenAddressFilterAtom,
  wantedTokenAddressFilterAtom,
} from '../../atoms/tokenFilterAtoms';

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
  const linkGenerator = useBlockchainExplorerLinkGenerator();
  const account = useAccount();
  const [isMobile] = useMediaQuery('(max-width: 640px)');
  const [offeredTokenAddressFilter] = useAtom(offeredTokenAddressFilterAtom);
  const [wantedTokenAddressFilter] = useAtom(wantedTokenAddressFilterAtom);

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
    onSuccess: refetchBalanceOf,
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

  if (
    (wantedTokenAddressFilter && wantedTokenAddressFilter !== order.wantedToken) ||
    (offeredTokenAddressFilter && offeredTokenAddressFilter !== order.offeredToken)
  ) {
    return null;
  }

  const isUserRecipient =
    order.recipient === ethers.constants.AddressZero ||
    order.recipient === account.address;

  return (
    <>
      {isMobile ? (
        <Tr>
          <Td px={0} colSpan={5}>
            <Flex direction="column">
              <Text textAlign="center">Order ID: {orderId.toString()}</Text>
              <Text textAlign="center" fontSize="xl" p={2}>
                Offers:
              </Text>
              <OfferSide
                tokenName={offeredTokenName!}
                tokenSymbol={offeredTokenSymbol!}
                tokenAddress={order.offeredToken}
                amount={order.amountOffered}
                decimals={offeredTokenDecimals!}
              />
              <Flex justify="center" align="center" direction="column">
                <ArrowBackIcon
                  rotate={90}
                  w={10}
                  h={10}
                  mb={-6}
                  transform="auto"
                  translateX="8px"
                />
                <ArrowForwardIcon
                  rotate={90}
                  w={10}
                  h={10}
                  transform="auto"
                  translateX="-8px"
                />
              </Flex>
              <Text textAlign="center" fontSize="xl" p={2}>
                In exchange for:
              </Text>
              <OfferSide
                tokenName={wantedTokenName!}
                tokenSymbol={wantedTokenSymbol!}
                tokenAddress={order.wantedToken}
                amount={order.amountWanted}
                decimals={wantedTokenDecimals!}
              />
              {!isOwner && (
                <Flex justifyContent="center">
                  <Link
                    target="_blank"
                    href={linkGenerator({
                      address: owner!,
                      type: 'address',
                    })}
                  >
                    <Flex alignItems="center" justifyContent="center">
                      <Text>Creator: {shortenAddress(owner)}</Text>
                      <ExternalLinkIcon ml={1} w={5} h={5} />
                    </Flex>
                  </Link>
                </Flex>
              )}
              <Flex justifyContent="center">
                <Flex alignItems="center" justifyContent="center">
                  <Text>
                    Filable by:{' '}
                    {order.recipient === ethers.constants.AddressZero
                      ? 'anyone'
                      : shortenAddress(order.recipient)}
                  </Text>
                </Flex>
              </Flex>

              <Flex justify="center" mt={2}>
                {isOwner ? (
                  <Button
                    onClick={() => cancelOffer?.()}
                    colorScheme="pink"
                    isLoading={cancelOfferStatus === 'loading'}
                  >
                    Close offer
                  </Button>
                ) : (
                  <Button
                    onClick={() => router.push(`/offer/${orderId}`)}
                    colorScheme="pink"
                    disabled={!isUserRecipient}
                  >
                    {isUserRecipient ? 'Accept offer' : 'This offer is not for you'}
                  </Button>
                )}
              </Flex>
            </Flex>
          </Td>
        </Tr>
      ) : (
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
                <ArrowForwardIcon
                  w={10}
                  h={10}
                  mb={-6}
                  transform="auto"
                  translateX="8px"
                />
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
                  <Button
                    onClick={() => router.push(`/offer/${orderId}`)}
                    colorScheme="pink"
                  >
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
        </>
      )}

      <Divider mb={2} />
    </>
  );
}

export default Offer;
