import { useNetwork } from 'wagmi';
import { isTestnet } from '../isTestnet';

interface BlockchainExplorerLinkGeneratorProps {
  type: 'token' | 'address' | 'tx';
  address: string;
}

export const createBlockchainExplorerLinkGenerator =
  (isTestnet: boolean) =>
  ({ type, address }: BlockchainExplorerLinkGeneratorProps) => {
    return `https://${isTestnet ? 'mumbai.' : ''}polygonscan.com/${type}/${address}`;
  };

export function useBlockchainExplorerLinkGenerator() {
  const { chain: network } = useNetwork();

  return createBlockchainExplorerLinkGenerator(isTestnet(network));
}
