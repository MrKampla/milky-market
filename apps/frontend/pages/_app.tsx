import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { WagmiConfig, createClient, chain, configureChains } from 'wagmi';
import {
  getDefaultWallets,
  lightTheme,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import GlobalModal from '../components/GlobalModal';

const { chains, provider } = configureChains(
  [chain.polygonMumbai, chain.polygon]
    .concat(process.env.NEXT_PUBLIC_VERCEL_ENV === 'development' ? [chain.hardhat] : [])
    .reverse(),
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY }),
    publicProvider(),
  ],
);

const { connectors } = getDefaultWallets({
  appName: 'Milky Market',
  chains,
});

const wagmiClient = createClient({
  autoConnect: false,
  connectors,
  provider,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        chains={chains}
        theme={lightTheme({
          accentColor: '#ED64A6',
        })}
      >
        <ChakraProvider>
          <Component {...pageProps} />
          <GlobalModal />
        </ChakraProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
