import { Box, Flex, useToast } from '@chakra-ui/react';
import { BigNumber, ethers } from 'ethers';
import {
  usePrepareContractWrite,
  useContractWrite,
  useConnect,
  useContractRead,
  useWaitForTransaction,
} from 'wagmi';
import ERC20ABI from '../../abis/ERC20ABI';
import MilkyMarketABI from '../../abis/MilkyMarketABI';
import { getMilkyMarketContractAddresses } from '../getMilkyMarketContractAddresses';
import { useAllowance } from './useAllowance';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useBlockchainExplorerLinkGenerator } from './useBlockchainExplorerLinkGenerator';
import { toastErrorHandler } from '../toastErrorHandler';
import { useGlobalModal } from './useGlobalModal';

export type OrderCreationData = {
  offeredToken: `0x${string}`;
  wantedToken: `0x${string}`;
  amountOffered: BigNumber;
  amountWanted: BigNumber;
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
  const { variables } = useConnect();
  const chainId = variables?.chainId;
  const { launchModalWith } = useGlobalModal();

  const { allowance, refetch: refetchAllowance } = useAllowance({
    tokenAddress: orderCreationData.offeredToken,
    spenderAddress: getMilkyMarketContractAddresses(chainId).milkyMarket,
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
    orderCreationData.amountOffered.mul(
      BigNumber.from(10).pow(offeredTokenDecimals ?? 1),
    ),
  );
  const formattedAmountWanted = BigNumber.from(
    orderCreationData.amountWanted.mul(BigNumber.from(10).pow(wantedTokenDecimals ?? 1)),
  );

  const isEnoughAllowance = allowance?.gte(formattedAmountOffered);

  const { config } = usePrepareContractWrite({
    address: getMilkyMarketContractAddresses(chainId).milkyMarket,
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
      !!orderCreationData.amountWanted,
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