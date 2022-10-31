import {
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Flex,
  Text,
  TableCaption,
  Skeleton,
} from '@chakra-ui/react';
import { useAccount, useConnect, useContractRead } from 'wagmi';
import MilkyMarketOrderManagerABI from '../../../abis/MilkyMarketOrderManagerABI';
import { getMilkyMarketContractAddresses } from '../../../utils/getMilkyMarketContractAddresses';
import LatestOffersList from '../latestOffers/LatestOffersList';
import UserOffersList from './UserOffersList';

function UserOffers() {
  const { variables } = useConnect();
  const account = useAccount();
  const chainId = variables?.chainId;
  const {
    data: userBalance,
    isLoading: isUserBalanceLoading,
    refetch: refetchBalanceOf,
  } = useContractRead({
    address: getMilkyMarketContractAddresses(chainId).milkyMarketOrderManager,
    abi: MilkyMarketOrderManagerABI,
    functionName: 'balanceOf',
    args: [account.address!],
    enabled: !!account.address,
  });

  return (
    <Skeleton isLoaded={!isUserBalanceLoading}>
      {account.address ? (
        <TableContainer>
          <Table variant="simple" size="sm">
            <TableCaption>
              Total number of your offers: {userBalance?.toNumber()}
            </TableCaption>
            <Thead>
              <Tr>
                <Th px={0} textAlign="center" w="min-content">
                  Order ID
                </Th>
                <Th px={0} textAlign="center">
                  Offer
                </Th>
                <Th px={0}></Th>
                <Th px={0} textAlign="center">
                  for
                </Th>
                <Th px={0} textAlign="center">
                  Cancel
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              <UserOffersList
                balanceOfUser={userBalance}
                refetchBalanceOf={() => refetchBalanceOf()}
              />
              {userBalance?.toNumber() === 0 && (
                <Tr>
                  <Td px={0} colSpan={5}>
                    <Flex justify="center">
                      <Text>You haven't created any offers yet</Text>
                    </Flex>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (
        <Text mt={10} textAlign="center">
          Connect your wallet to see your offers
        </Text>
      )}
    </Skeleton>
  );
}

export default UserOffers;
