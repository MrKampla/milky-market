import { useToast } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
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

  const { config: fillOrderConfig } = usePrepareContractWrite({
    address: getMilkyMarketContractAddresses(chainId).milkyMarket,
    abi: MilkyMarketABI,
    functionName: 'fillOrder',
    args: [orderId!],
    enabled: !!orderId && isEnoughAllowance,
  });

  const {
    data: fillOrderData,
    status: fillOrderStatus,
    write: fillOrder,
  } = useContractWrite({
    ...fillOrderConfig,
    ...toastErrorHandler(toast),
  });

  useWaitForTransaction({
    hash: fillOrderData?.hash,
    onSuccess(data) {
      onSuccess?.();

      launchModalWith({
        title: 'Order Filled',
        label: 'The order has been filled.',
        transactionHash: data.transactionHash,
      });
    },
  });

  return {
    fillOrderStatus,
    fillOrder,
  };
}
