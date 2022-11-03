import { ToastId, useToast } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
import { useRef } from 'react';
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi';
import MilkyMarketABI from '../../abis/MilkyMarketABI';
import { getMilkyMarketContractAddresses } from '../getMilkyMarketContractAddresses';
import { toastErrorHandler } from '../toastErrorHandler';
import { useChainId } from './useChainId';
import { useGlobalModal } from './useGlobalModal';

export function useFillOrder({
  orderId,
  isEnoughAllowance,
  onSuccess,
}: {
  orderId: BigNumber | undefined;
  isEnoughAllowance: boolean;
  onSuccess?: () => void;
}) {
  const { launchModalWith } = useGlobalModal();
  const chainId = useChainId();
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();

  const { config: fillOrderConfig } = usePrepareContractWrite({
    address: getMilkyMarketContractAddresses(chainId).milkyMarket,
    abi: MilkyMarketABI,
    functionName: 'fillOrder',
    args: [orderId!],
    enabled: !!orderId && isEnoughAllowance,
  });

  const {
    data: fillOrderData,

    write: fillOrder,
  } = useContractWrite({
    ...fillOrderConfig,
    ...toastErrorHandler(toast),
    onSuccess: () => {
      toastIdRef.current = toast({
        colorScheme: 'blue',
        title: 'Filling the order...',
        duration: null,
        status: 'info',
        position: 'top-right',
      });
    },
  });

  const { status: fillOrderStatus } = useWaitForTransaction({
    hash: fillOrderData?.hash,
    onSuccess(data) {
      if (toastIdRef.current) {
        toast.close(toastIdRef.current);
      }

      launchModalWith({
        title: 'Order Filled',
        label: 'The order has been filled.',
        transactionHash: data.transactionHash,
      });

      onSuccess?.();
    },
  });

  return {
    fillOrderStatus,
    fillOrder,
  };
}
