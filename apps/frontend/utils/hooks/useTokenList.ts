import { useEffect, useState } from 'react';
import axios from 'axios';
import { chain, useConnect } from 'wagmi';

export interface Token {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
}

export interface TokenListResponse {
  tokens: Token[];
}

const milkyCoinObject: Token = {
  address: '0x296480179b8b79c9C9588b275E69d58f0d1BCa67',
  name: 'MilkyCoin',
  symbol: 'MIC',
  chainId: 137,
  decimals: 18,
  logoURI:
    'https://stmosaicoprod.blob.core.windows.net/ci-documents/e86f9701-3125-4a63-9a21-414655b5131d.jpeg',
};

function useTokenList() {
  const { variables } = useConnect();
  const chainId = variables?.chainId ?? chain.polygon.id;
  const [tokenList, setTokenList] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get<TokenListResponse>('https://gateway.ipfs.io/ipns/tokens.uniswap.org')
      .then((res) =>
        setTokenList(
          [milkyCoinObject]
            .concat(res.data.tokens.map(handleTokensWithIPFSLogos))
            .filter((token) => token.chainId === chainId),
        ),
      )
      .catch(() => setIsError(true))
      .finally(() => setLoading(false));
  }, []);

  return { tokenList, loading, isError };
}

const handleTokensWithIPFSLogos = (token: Token) => {
  if (token.logoURI.startsWith('ipfs')) {
    return {
      ...token,
      logoURI: `https://ipfs.io/ipfs/${removeProtocolFromLink(token.logoURI)}`,
    };
  }
  return token;
};

function removeProtocolFromLink(link: string) {
  return link.slice(7);
}

export default useTokenList;
