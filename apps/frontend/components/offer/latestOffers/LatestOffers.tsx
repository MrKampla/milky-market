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
import { useContractRead } from 'wagmi';
import MilkyMarketOrderManagerABI from '../../../abis/MilkyMarketOrderManagerABI';
import { getMilkyMarketContractAddresses } from '../../../utils/getMilkyMarketContractAddresses';
import { useChainId } from '../../../utils/hooks/useChainId';
import LatestOffersList from './LatestOffersList';

function LatestOffers() {
  const chainId = useChainId();
  const { data: totalSupply, isLoading: isTotalSupplyLoading } = useContractRead({
    address: getMilkyMarketContractAddresses(chainId).milkyMarketOrderManager,
    abi: MilkyMarketOrderManagerABI,
    functionName: 'totalSupply',
    watch: true,
  });
  const [isMobile] = useMediaQuery('(max-width: 640px)');

  return (
    <Skeleton isLoaded={!isTotalSupplyLoading}>
      <TableContainer>
        <Table variant="striped" size="sm">
          <TableCaption>Total number of offers: {totalSupply?.toNumber()}</TableCaption>
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
                  Accept
                </Th>
              </Tr>
            )}
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
