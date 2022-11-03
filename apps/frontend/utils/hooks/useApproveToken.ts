import { ToastId, useToast } from '@chakra-ui/react';
import { BigNumber, ethers } from 'ethers';
import { useRef } from 'react';
import {
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import ERC20ABI from '../../abis/ERC20ABI';
import { getMilkyMarketContractAddresses } from '../getMilkyMarketContractAddresses';
import { toastErrorHandler } from '../toastErrorHandler';
import { useChainId } from './useChainId';

export function useApproveToken({
  tokenAddress,
  amount,
  onSuccess,
}: {
  tokenAddress: string | undefined;
  amount: BigNumber | undefined;
  onSuccess?: () => void;
}) {
  const chainId = useChainId();
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();

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
    args: [getMilkyMarketContractAddresses(chainId).milkyMarket, amount!],
    enabled: !!decimals && ethers.utils.isAddress(tokenAddress ?? '') && !!amount,
  });

  const { data: approveTokenData, write: approveToken } = useContractWrite({
    ...approveConfig,
    ...toastErrorHandler(toast),
    onSuccess() {
      toastIdRef.current = toast({
        colorScheme: 'blue',
        title: 'Approving',
        description: 'Approving MilkyMarket to use your tokens...',
        duration: null,
        status: 'info',
        position: 'top-right',
      });
    },
  });
  const { data: approveData, status: approveStatus } = useWaitForTransaction({
    hash: approveTokenData?.hash,
    confirmations: 1,
    onSuccess() {
      if (toastIdRef.current) {
        toast.close(toastIdRef.current);
      }
      toast({
        colorScheme: 'green',
        title: 'Success',
        description: 'Successfully approved MilkyMarket to use tokens',
        status: 'success',
        duration: 9000,
        isClosable: true,
        position: 'top-right',
      });
      onSuccess?.();
    },
  });

  return {
    approveData,
    approveStatus,
    approveToken,
  };
}
