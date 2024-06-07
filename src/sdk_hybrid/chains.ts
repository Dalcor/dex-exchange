export enum DexChainId {
  // MAINNET = 1,
  SEPOLIA = 11155111,
  // CALLISTO = 820,
  BSC_TESTNET = 97,
}

const getEnumValues = <T extends { [key: string]: any }>(enumObj: T): Array<T[keyof T]> => {
  return Object.values(enumObj).filter((v) => !isNaN(Number(v)));
};

export const DEX_SUPPORTED_CHAINS = getEnumValues(DexChainId);

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
