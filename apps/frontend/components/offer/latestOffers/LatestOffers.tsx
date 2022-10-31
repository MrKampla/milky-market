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
import { useConnect, useContractRead } from 'wagmi';
import MilkyMarketOrderManagerABI from '../../../abis/MilkyMarketOrderManagerABI';
import { getMilkyMarketContractAddresses } from '../../../utils/getMilkyMarketContractAddresses';
import LatestOffersList from './LatestOffersList';

function LatestOffers() {
  const { variables } = useConnect();
  const chainId = variables?.chainId;
  const { data: totalSupply, isLoading: isTotalSupplyLoading } = useContractRead({
    address: getMilkyMarketContractAddresses(chainId).milkyMarketOrderManager,
    abi: MilkyMarketOrderManagerABI,
    functionName: 'totalSupply',
  });

  return (
    <Skeleton isLoaded={!isTotalSupplyLoading}>
      <TableContainer>
        <Table variant="striped" size="sm">
          <TableCaption>Total number of offers: {totalSupply?.toNumber()}</TableCaption>
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
                Accept
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            <LatestOffersList totalSupply={totalSupply} />
            {totalSupply?.toNumber() === 0 && (
              <Tr>
                <Td px={0} colSpan={5}>
                  <Flex justify="center">
                    <Text>No offers yet</Text>
                  </Flex>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Skeleton>
  );
}

export default LatestOffers;
