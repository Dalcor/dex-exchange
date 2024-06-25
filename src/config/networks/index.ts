import { DexChainId } from "@/sdk_hybrid/chains";

export const networks: Array<{
  chainId: DexChainId;
  name: string;
  symbol: string;
  logo: string;
}> = [
  // {
  //   chainId: DexChainId.CALLISTO,
  //   name: "Callisto",
  //   logo: "/chains/callisto.svg",
  // },
  {
    chainId: DexChainId.SEPOLIA,
    name: "Sepolia",
    symbol: "SEP",
    logo: "/chains/sepolia.svg",
  },
  {
    chainId: DexChainId.BSC_TESTNET,
    name: "BSC Testnet",
    symbol: "BNB",
    logo: "/chains/bsc.svg",
  },
];
