import { useAccount, useContractRead } from 'wagmi';
import ERC20ABI from '../../abis/ERC20ABI';

export function useTokenBalanceOfUser({
  address,
}: {
  address?: `0x${string}` | undefined;
}) {
  const account = useAccount();

  return useContractRead({
    address,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: [account.address!],
    enabled: !!account.address,
    watch: true,
  });
}
