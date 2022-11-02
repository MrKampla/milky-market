import { chain, useNetwork } from 'wagmi';

interface BlockchainExplorerLinkGeneratorProps {
  type: 'token' | 'address' | 'tx';
  address: string;
}

const createBlockchainExplorerLinkGenerator =
  (isTestnet: boolean) =>
  ({ type, address }: BlockchainExplorerLinkGeneratorProps) => {
    return `https://${isTestnet ? 'mumbai.' : ''}polygonscan.com/${type}/${address}`;
  };

export function useBlockchainExplorerLinkGenerator() {
  const { chain: network } = useNetwork();
  const isTestnet =
    network?.id === chain.polygonMumbai.id ||
    network?.id === chain.hardhat.id ||
    network?.id === chain.localhost.id;

  return createBlockchainExplorerLinkGenerator(isTestnet);
}
