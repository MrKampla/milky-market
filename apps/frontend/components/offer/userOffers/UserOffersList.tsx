import { Skeleton, Td, Tr } from '@chakra-ui/react';
import { BigNumber, BigNumberish } from 'ethers';
import React from 'react';
import { useAccount, useContractRead } from 'wagmi';
import MilkyMarketOrderManagerABI from '../../../abis/MilkyMarketOrderManagerABI';
import { getMilkyMarketContractAddresses } from '../../../utils/getMilkyMarketContractAddresses';
import { useChainId } from '../../../utils/hooks/useChainId';
import Offer from '../Offer';

const EnumaratedOffer = ({
  offerIndex,
  refetchBalanceOf,
}: {
  offerIndex: BigNumber;
  refetchBalanceOf: () => void;
}) => {
  const account = useAccount();
  const chainId = useChainId();
  const { data: orderId, isLoading: isOrderIdLoading } = useContractRead({
    address: getMilkyMarketContractAddresses(chainId).milkyMarketOrderManager,
    abi: MilkyMarketOrderManagerABI,
    functionName: 'tokenOfOwnerByIndex',
    args: [account.address!, offerIndex],
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

  return <Offer orderId={orderId} isOwner={true} refetchBalanceOf={refetchBalanceOf} />;
};

function UserOffersList({
  balanceOfUser,
  refetchBalanceOf,
}: {
  balanceOfUser: BigNumberish | undefined;
  refetchBalanceOf: () => void;
}) {
  if (!balanceOfUser || BigNumber.from(0).eq(balanceOfUser)) {
    return null;
  }

  return (
    <>
      {new Array(Number(balanceOfUser)).fill(0).map((_, index) => (
        <EnumaratedOffer
          key={index}
          offerIndex={BigNumber.from(index)}
          refetchBalanceOf={refetchBalanceOf}
        />
      ))}
    </>
  );
}

export default UserOffersList;
