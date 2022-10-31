import { useToast } from '@chakra-ui/react';
import { BigNumber, ethers } from 'ethers';
import {
  useConnect,
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
} from 'wagmi';
import ERC20ABI from '../../abis/ERC20ABI';
import { getMilkyMarketContractAddresses } from '../getMilkyMarketContractAddresses';
import { toastErrorHandler } from '../toastErrorHandler';

export function useApproveToken({
  tokenAddress,
  amount,
  onSuccess,
}: {
  tokenAddress: string | undefined;
  amount: BigNumber | undefined;
  onSuccess?: () => void;
}) {
  const { variables } = useConnect();
  const chainId = variables?.chainId;
  const toast = useToast();

  const { data: decimals } = useContractRead({
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: 'decimals',
    enabled: ethers.utils.isAddress(tokenAddress ?? ''),
  });

  const { config: approveConfig } = usePrepareContractWrite({
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: 'approve',
    args: [
      getMilkyMarketContractAddresses(chainId).milkyMarket,
      BigNumber.from(amount?.mul(BigNumber.from(10).pow(decimals ?? 1)) || 0),
    ],
    enabled: !!decimals && ethers.utils.isAddress(tokenAddress ?? '') && !!amount,
  });

  const { status: approveStatus, write: approveToken } = useContractWrite({
    ...approveConfig,
    ...toastErrorHandler(toast),
    onSuccess() {
      onSuccess?.();
      toast({
        colorScheme: 'green',
        title: 'Success',
        description: 'Successfully approved MilkyMarket to use tokens',
        status: 'success',
        duration: 9000,
        isClosable: true,
        position: 'top-right',
      });
    },
  });

  return {
    approveStatus,
    approveToken,
  };
}
