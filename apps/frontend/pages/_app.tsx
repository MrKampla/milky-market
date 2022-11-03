import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { WagmiConfig, createClient, configureChains } from 'wagmi';
import {
  getDefaultWallets,
  lightTheme,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import GlobalModal from '../components/GlobalModal';
import Head from 'next/head';
import { useChainId } from '../utils/hooks/useChainId';
import { CHAINS } from '../utils/chains';

const { chains, provider } = configureChains(CHAINS, [
  alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY }),
  publicProvider(),
]);

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
  useChainId();
  return (
    <WagmiConfig client={wagmiClient}>
      <Head>
        <title>Milky Market - Decentralized ERC20 spot exchange on Polygon</title>
      </Head>
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
