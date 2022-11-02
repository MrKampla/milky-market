import { useToast } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
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
  refetchBalanceOf,
}: {
  orderId: BigNumber;
  isOwner: boolean;
  refetchBalanceOf?: () => void;
}) {
  const { launchModalWith } = useGlobalModal();
  const toast = useToast();
  const { chain } = useNetwork();

  const { config } = usePrepareContractWrite({
    address: getMilkyMarketContractAddresses(chain?.id).milkyMarket,
    abi: MilkyMarketABI,
    functionName: 'cancelOrder',
    args: [orderId],
    enabled: isOwner,
  });

  const {
    data: cancelOfferData,
    status,
    write,
  } = useContractWrite({
    ...config,
    ...toastErrorHandler(toast),
  });

  useWaitForTransaction({
    wait: cancelOfferData?.wait,
    onSuccess(data) {
      refetchBalanceOf?.();
      launchModalWith({
        title: 'Order created',
        label: 'The order has been created.',
        transactionHash: data.transactionHash,
      });
    },
  });

  return {
    cancelOffer: write,
    cancelOfferStatus: status,
  };
}
