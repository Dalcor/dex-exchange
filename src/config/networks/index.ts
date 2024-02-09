import { AvailableChains } from "@/components/dialogs/stores/useConnectWalletStore";

export const networks: Array<{
  chainId: AvailableChains,
  name: string,
  logo: string
}> = [
  {
    chainId: 1,
    name: "Ethereum",
    logo: "/chains/ethereum.svg"
  },
  {
    chainId: 56,
    name: "BSC Chain",
    logo: "/chains/bsc.svg"
  },
  {
    chainId: 820,
    name: "Callisto",
    logo: "/chains/callisto.svg"
  },
  {
    chainId: 137,
    name: "Polygon",
    logo: "/chains/polygon.svg"
  },
  {
    chainId: 10,
    name: "Optimism",
    logo: "/chains/optimism.svg"
  },
  {
    chainId: 42161,
    name: "Arbitrum",
    logo: "/chains/arbitrum.svg"
  },
  {
    chainId: 42220,
    name: "Celo",
    logo: "/chains/celo.svg"
  },
  {
    chainId: 43114,
    name: "Avalanche",
    logo: "/chains/avalanche.svg"
  },
  {
    chainId: 8453,
    name: "Base",
    logo: "/chains/base.svg"
  }
];
