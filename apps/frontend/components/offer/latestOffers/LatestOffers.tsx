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
  Button,
} from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { useContractRead } from 'wagmi';
import MilkyMarketOrderManagerABI from '../../../abis/MilkyMarketOrderManagerABI';
import {
  maxOfferPageCountAtom,
  OFFER_PAGE_SIZE,
} from '../../../atoms/maxOfferPageCountAtom';
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
  const [pageOfferCount, setMaxOfferPageCount] = useAtom(maxOfferPageCountAtom);

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
      {totalSupply && pageOfferCount < totalSupply.toNumber() && (
        <Flex justifyContent="center" w="full">
          <Button onClick={() => setMaxOfferPageCount((v) => v + OFFER_PAGE_SIZE)}>
            Load more
          </Button>
        </Flex>
      )}
    </Skeleton>
  );
}

export default LatestOffers;
