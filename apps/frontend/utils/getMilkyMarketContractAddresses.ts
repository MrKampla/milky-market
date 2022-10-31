const contractAddresses = {
  31337: {
    milkyMarket: '0xA322313771d0B1c9DB45a7995B28b4347799384c',
    milkyMarketOrderManager: '0x57d8127706C1769179144C57DC2B7a23Ad81F8Db',
  } as const,
};

export function getMilkyMarketContractAddresses(chainId: number | undefined) {
  return (
    contractAddresses[chainId as keyof typeof contractAddresses] ??
    contractAddresses[31337]
  );
}
