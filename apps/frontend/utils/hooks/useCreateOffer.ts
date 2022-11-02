import { useToast } from '@chakra-ui/react';
import { BigNumber, ethers } from 'ethers';
import {
  usePrepareContractWrite,
  useContractWrite,
  useContractRead,
  useWaitForTransaction,
  useNetwork,
} from 'wagmi';
import ERC20ABI from '../../abis/ERC20ABI';
import MilkyMarketABI from '../../abis/MilkyMarketABI';
import { getMilkyMarketContractAddresses } from '../getMilkyMarketContractAddresses';
import { useAllowance } from './useAllowance';
import { toastErrorHandler } from '../toastErrorHandler';
import { useGlobalModal } from './useGlobalModal';

export type OrderCreationData = {
  offeredToken: `0x${string}`;
  wantedToken: `0x${string}`;
  amountOffered: string;
  amountWanted: string;
  recipient: `0x${string}`;
  isPrivate: boolean;
};

export function useCreateOffer({
  orderCreationData,
  onSuccess,
}: {
  orderCreationData: OrderCreationData;
  onSuccess?: () => void;
}) {
  const toast = useToast();
  const { chain } = useNetwork();
  const { launchModalWith } = useGlobalModal();

  const { allowance, refetch: refetchAllowance } = useAllowance({
    tokenAddress: orderCreationData.offeredToken,
    spenderAddress: getMilkyMarketContractAddresses(chain?.id).milkyMarket,
  });

  const { data: offeredTokenDecimals } = useContractRead({
    address: orderCreationData.offeredToken,
    abi: ERC20ABI,
    functionName: 'decimals',
    enabled: ethers.utils.isAddress(orderCreationData.offeredToken),
  });

  const { data: wantedTokenDecimals } = useContractRead({
    address: orderCreationData.wantedToken,
    abi: ERC20ABI,
    functionName: 'decimals',
    enabled: ethers.utils.isAddress(orderCreationData.wantedToken),
  });

  const formattedAmountOffered = BigNumber.from(
    ethers.utils.parseUnits(
      orderCreationData.amountOffered || '0',
      offeredTokenDecimals || 18,
    ),
  );
  const formattedAmountWanted = BigNumber.from(
    ethers.utils.parseUnits(
      orderCreationData.amountWanted || '0',
      wantedTokenDecimals || 18,
    ),
  );

  const isEnoughAllowance = allowance?.gte(formattedAmountOffered);

  const { config } = usePrepareContractWrite({
    address: getMilkyMarketContractAddresses(chain?.id).milkyMarket,
    abi: MilkyMarketABI,
    functionName: 'createOrder',
    args: [
      {
        ...orderCreationData,
        amountOffered: formattedAmountOffered,
        amountWanted: formattedAmountWanted,
      },
    ],
    enabled:
      isEnoughAllowance &&
      ethers.utils.isAddress(orderCreationData.wantedToken) &&
      !!orderCreationData.amountWanted &&
      !!orderCreationData.amountWanted &&
      !!orderCreationData.amountOffered,
  });
  const {
    data: createOrderData,
    status: createOrderStatus,
    writeAsync: createOrder,
  } = useContractWrite({
    ...config,
    ...toastErrorHandler(toast),
  });

  useWaitForTransaction({
    wait: createOrderData?.wait,
    onSuccess(data) {
      onSuccess?.();
      launchModalWith({
        title: 'Order created',
        label: 'The order has been created.',
        transactionHash: data.transactionHash,
      });
    },
  });

  return {
    createOrderStatus,
    createOrder,
    isEnoughAllowance,
    refetchAllowance,
  };
}
