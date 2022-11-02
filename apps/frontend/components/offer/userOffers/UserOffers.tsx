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
  useMediaQuery,
} from '@chakra-ui/react';
import { useAccount, useContractRead, useNetwork } from 'wagmi';
import MilkyMarketOrderManagerABI from '../../../abis/MilkyMarketOrderManagerABI';
import { getMilkyMarketContractAddresses } from '../../../utils/getMilkyMarketContractAddresses';
import UserOffersList from './UserOffersList';

function UserOffers() {
  const account = useAccount();
  const { chain } = useNetwork();
  const {
    data: userBalance,
    isLoading: isUserBalanceLoading,
    refetch: refetchBalanceOf,
  } = useContractRead({
    address: getMilkyMarketContractAddresses(chain?.id).milkyMarketOrderManager,
    abi: MilkyMarketOrderManagerABI,
    functionName: 'balanceOf',
    args: [account.address!],
    enabled: !!account.address,
  });
  const [isMobile] = useMediaQuery('(max-width: 640px)');

  return (
    <Skeleton isLoaded={!isUserBalanceLoading}>
      {account.address ? (
        <TableContainer>
          <Table variant="simple" size="sm">
            <TableCaption>
              Total number of your offers: {userBalance?.toNumber()}
            </TableCaption>
            <Thead>
              {!isMobile && (
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
              )}
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
                      <Text>{`You haven't created any offers yet`}</Text>
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
