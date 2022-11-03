import { BigNumber } from 'ethers';
import { useState } from 'react';
import { useContractRead } from 'wagmi';
import MilkyMarketOrderManagerABI from '../../abis/MilkyMarketOrderManagerABI';
import { getMilkyMarketContractAddresses } from '../getMilkyMarketContractAddresses';
import { useChainId } from './useChainId';
import { useTokenData } from './useTokenData';

export function useOfferData(orderId: BigNumber) {
  const [doesOrderExist, setDoesOrderExist] = useState(true);
  const chainId = useChainId();

  const { data: order, isLoading: isOrderLoading } = useContractRead({
    address: getMilkyMarketContractAddresses(chainId).milkyMarketOrderManager,
    abi: MilkyMarketOrderManagerABI,
    functionName: 'getOrder',
    args: [orderId!],
    enabled: !!orderId,
    watch: true,
  });

  const { data: owner, isLoading: isOwnerLoading } = useContractRead({
    address: getMilkyMarketContractAddresses(chainId).milkyMarketOrderManager,
    abi: MilkyMarketOrderManagerABI,
    functionName: 'ownerOf',
    args: [orderId!],
    enabled: !!orderId,
    onError(error) {
      if ((error as any).reason === 'ERC721: invalid token ID') {
        setDoesOrderExist(false);
      }
    },
  });

  const {
    name: offeredTokenName,
    symbol: offeredTokenSymbol,
    decimals: offeredTokenDecimals,
    isLoading: isOfferedTokenLoading,
  } = useTokenData(order?.offeredToken);
  const {
    name: wantedTokenName,
    symbol: wantedTokenSymbol,
    decimals: wantedTokenDecimals,
    isLoading: isWantedTokenLoading,
  } = useTokenData(order?.wantedToken);

  return {
    doesOrderExist,
    order,
    owner,
    offeredTokenName,
    offeredTokenSymbol,
    offeredTokenDecimals,
    wantedTokenName,
    wantedTokenSymbol,
    wantedTokenDecimals,
    isLoading:
      isOrderLoading || isOfferedTokenLoading || isWantedTokenLoading || isOwnerLoading,
  };
}
