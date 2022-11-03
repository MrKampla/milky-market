import { chain } from 'wagmi';

export const CHAINS = [chain.polygonMumbai]
  .concat(process.env.NEXT_PUBLIC_VERCEL_ENV === 'development' ? [chain.hardhat] : [])
  .reverse();
