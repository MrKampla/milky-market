import { ethers } from 'ethers';
import { useContractReads } from 'wagmi';
import ERC20ABI from '../../abis/ERC20ABI';

export function useTokenData(tokenAddress?: string) {
  const { data, isLoading } = useContractReads({
    contracts: [
      {
        address: tokenAddress,
        abi: ERC20ABI,
        functionName: 'name',
        enabled: !!tokenAddress && ethers.utils.isAddress(tokenAddress),
      },
      {
        address: tokenAddress,
        abi: ERC20ABI,
        functionName: 'symbol',
        enabled: !!tokenAddress && ethers.utils.isAddress(tokenAddress),
      },
      {
        address: tokenAddress,
        abi: ERC20ABI,
        functionName: 'decimals',
        enabled: !!tokenAddress && ethers.utils.isAddress(tokenAddress),
      },
    ],
  });

  return {
    name: data?.[0],
    symbol: data?.[1],
    decimals: data?.[2],
    isLoading,
  };
}
