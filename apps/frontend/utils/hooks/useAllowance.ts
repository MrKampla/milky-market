import { ethers } from 'ethers';
import { useAccount, useContractRead } from 'wagmi';
import ERC20ABI from '../../abis/ERC20ABI';

export function useAllowance({
  tokenAddress,
  spenderAddress,
}: {
  tokenAddress: string | undefined;
  spenderAddress: `0x${string}`;
}) {
  const account = useAccount();
  const {
    data: allowance,
    isLoading,
    refetch,
  } = useContractRead({
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: [account.address!, spenderAddress],
    enabled: ethers.utils.isAddress(tokenAddress ?? ''),
    watch: true,
  });

  return {
    allowance,
    isLoading,
    refetch,
  };
}
