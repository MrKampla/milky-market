import { Skeleton, Td, Tr } from '@chakra-ui/react';
import { BigNumber, BigNumberish } from 'ethers';
import React from 'react';
import { useContractRead } from 'wagmi';
import MilkyMarketOrderManagerABI from '../../../abis/MilkyMarketOrderManagerABI';
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
  if (!totalSupply || BigNumber.from(0).eq(totalSupply)) {
    return null;
  }

  return (
    <>
      {new Array(Number(totalSupply)).fill(0).map((_, index) => (
        <EnumaratedOffer key={index} offerIndex={BigNumber.from(index)} />
      ))}
    </>
  );
}

export default LatestOffersList;
