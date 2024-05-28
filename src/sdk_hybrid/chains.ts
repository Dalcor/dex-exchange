export enum DexChainId {
  // MAINNET = 1,
  SEPOLIA = 11155111,
  CALLISTO = 820,
  BSC_TESTNET = 97,
}

export const DEX_SUPPORTED_CHAINS = [
  DexChainId.SEPOLIA,
  DexChainId.CALLISTO,
  DexChainId.BSC_TESTNET,
];

export type SupportedChainsType = (typeof DEX_SUPPORTED_CHAINS)[number];

export enum NativeCurrencyName {
  // Strings match input for CLI
  ETHER = "ETH",
  MATIC = "MATIC",
  CELO = "CELO",
  GNOSIS = "XDAI",
  MOONBEAM = "GLMR",
  BNB = "BNB",
  AVAX = "AVAX",
  ROOTSTOCK = "RBTC",
}
