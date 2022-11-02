import { Chain, chain } from 'wagmi';

export const isTestnet = (network: Chain | undefined) => {
  if (!network) {
    return false;
  }
  return (
    network?.id === chain.polygonMumbai.id ||
    network?.id === chain.hardhat.id ||
    network?.id === chain.localhost.id
  );
};
