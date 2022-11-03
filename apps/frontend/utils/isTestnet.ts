import { chain } from 'wagmi';

export const isTestnet = (chainId: number | undefined) => {
  if (!chainId) {
    return false;
  }
  return (
    chainId === chain.polygonMumbai.id ||
    chainId === chain.hardhat.id ||
    chainId === chain.localhost.id
  );
};
