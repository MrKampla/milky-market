import { isTestnet } from '../isTestnet';
import { useChainId } from './useChainId';

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
  const chainId = useChainId();

  return createBlockchainExplorerLinkGenerator(isTestnet(chainId));
}
