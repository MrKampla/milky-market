import { chain } from 'wagmi';

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
  [chain.polygonMumbai.id]: {
    milkyMarket: '0x8ed0aD356eB9A66A8a880D314c29bb3c067c10E2',
    milkyMarketOrderManager: '0x097eb96Cf9250896C44Db98c04022FDF144051f4',
  } as const,
};

export function getMilkyMarketContractAddresses(chainId: number | undefined) {
  return (
    contractAddresses[chainId as keyof typeof contractAddresses] ??
    contractAddresses[31337]
  );
}
