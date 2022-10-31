import { chain, useConnect } from 'wagmi';

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
  const { variables } = useConnect();
  const chainId = variables?.chainId;
  const isTestnet =
    chainId === chain.polygonMumbai.id ||
    chainId === chain.hardhat.id ||
    chainId === chain.localhost.id;

  return createBlockchainExplorerLinkGenerator(isTestnet);
}
