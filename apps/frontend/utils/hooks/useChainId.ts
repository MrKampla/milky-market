import { useNetwork } from 'wagmi';
import { CHAINS } from '../chains';

export const useChainId = () => {
  const { chain } = useNetwork();

  return chain?.id ?? CHAINS[0].id;
};
