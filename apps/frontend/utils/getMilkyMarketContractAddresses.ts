// import { chain } from 'wagmi';

const contractAddresses = {
  // hardhat local environment
  31337: {
    milkyMarket: process.env.NEXT_PUBLIC_LOCAL_MILKY_MARKET_ADDRESS! as `0x${string}`,
    milkyMarketOrderManager: process.env
      .NEXT_PUBLIC_LOCAL_MILKY_MARKET_ORDER_MANAGER_ADDRESS! as `0x${string}`,
  } as const,
  // TBD
  // [chain.polygon.id]: {
  //   milkyMarket: 'TBD',
  //   milkyMarketOrderManager: 'TBD',
  // } as const,
  // [chain.polygonMumbai.id]: {
  //   milkyMarket: 'TBD',
  //   milkyMarketOrderManager: 'TBD',
  // } as const,
};

export function getMilkyMarketContractAddresses(chainId: number | undefined) {
  return (
    contractAddresses[chainId as keyof typeof contractAddresses] ??
    contractAddresses[31337]
  );
}
