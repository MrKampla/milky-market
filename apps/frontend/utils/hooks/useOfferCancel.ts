import { ToastId, useToast } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
import { useRef } from 'react';
import {
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import MilkyMarketABI from '../../abis/MilkyMarketABI';
import { getMilkyMarketContractAddresses } from '../getMilkyMarketContractAddresses';
import { toastErrorHandler } from '../toastErrorHandler';
import { useGlobalModal } from './useGlobalModal';

export function useOfferCancel({
  isOwner,
  orderId,
  onSuccess,
}: {
  orderId: BigNumber;
  isOwner: boolean;
  onSuccess?: () => void;
}) {
  const { launchModalWith } = useGlobalModal();
  const toast = useToast();
  const { chain } = useNetwork();
  const toastIdRef = useRef<ToastId>();

  const { config } = usePrepareContractWrite({
    address: getMilkyMarketContractAddresses(chain?.id).milkyMarket,
    abi: MilkyMarketABI,
    functionName: 'cancelOrder',
    args: [orderId],
    enabled: isOwner,
  });

  const { data: cancelOfferData, write } = useContractWrite({
    ...config,
    ...toastErrorHandler(toast),
    onSuccess: () => {
      toastIdRef.current = toast({
        colorScheme: 'blue',
        title: 'Cancelling the offer...',
        duration: null,
        status: 'info',
        position: 'top-right',
      });
    },
  });

  const { status } = useWaitForTransaction({
    hash: cancelOfferData?.hash,
    confirmations: 1,
    onSuccess(data) {
      if (toastIdRef.current) {
        toast.close(toastIdRef.current);
      }
      launchModalWith({
        title: 'Order canncelled',
        label: 'Your order has been cancelled.',
        transactionHash: data.transactionHash,
      });
      onSuccess?.();
    },
  });

  return {
    cancelOffer: write,
    cancelOfferStatus: status,
  };
}
