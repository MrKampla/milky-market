import { Button, Flex, Skeleton, Td, Tr } from '@chakra-ui/react';
import { BigNumber, BigNumberish } from 'ethers';
import { atom, useAtomValue } from 'jotai';
import React from 'react';
import { useContractRead } from 'wagmi';
import MilkyMarketOrderManagerABI from '../../../abis/MilkyMarketOrderManagerABI';
import { maxOfferPageCountAtom } from '../../../atoms/maxOfferPageCountAtom';
import { getMilkyMarketContractAddresses } from '../../../utils/getMilkyMarketContractAddresses';
import { useChainId } from '../../../utils/hooks/useChainId';
import Offer from '../Offer';

const EnumaratedOffer = ({ offerIndex }: { offerIndex: BigNumber }) => {
  const chainId = useChainId();
  const { data: orderId, isLoading: isOrderIdLoading } = useContractRead({
    address: getMilkyMarketContractAddresses(chainId).milkyMarketOrderManager,
    abi: MilkyMarketOrderManagerABI,
    functionName: 'tokenByIndex',
    args: [offerIndex],
    watch: true,
  });

  if (isOrderIdLoading) {
    return (
      <Tr>
        <Td px={0} colSpan={5}>
          <Skeleton h={16} />
        </Td>
      </Tr>
    );
  }

  if (!orderId) {
    return null;
  }

  return <Offer orderId={orderId} />;
};

function LatestOffersList({ totalSupply }: { totalSupply: BigNumberish | undefined }) {
  const offerCount = useAtomValue(maxOfferPageCountAtom);

  if (!totalSupply || BigNumber.from(0).eq(totalSupply)) {
    return null;
  }

  const offerIndexesToDisplay = new Array(Number(totalSupply))
    .fill(0)
    .map((_, index) => index)
    .reverse();

  return (
    <>
      {offerIndexesToDisplay.map(
        (offerIndex, arrayIndex) =>
          arrayIndex < offerCount && (
            <EnumaratedOffer key={offerIndex} offerIndex={BigNumber.from(offerIndex)} />
          ),
      )}
    </>
  );
}

export default LatestOffersList;
