// find coingecko network id here: https://api.coingecko.com/api/v3/asset_platforms

import { AvailableChains } from "@/components/dialogs/stores/useConnectWalletStore";

const idMap = {
  42161: "arbitrum-one",
  1: "ethereum",
  56: "binance-smart-chain",
  61: "ethereum-classic",
  820: "callisto",
  10: "optimistic-ethereum",
  137: "polygon-pos",
  42220: "celo",
  43114: "avalanche",
  8453: "base",
};

export function getCoingeckoTokenListURI(chainId: AvailableChains) {
  return `https://tokens.coingecko.com/${idMap[chainId]}/all.json`;
}
