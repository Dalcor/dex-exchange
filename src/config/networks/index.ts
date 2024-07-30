import { DexChainId } from "@/sdk_hybrid/chains";

export const networks: Array<{
  chainId: DexChainId;
  name: string;
  symbol: string;
  logo: string;
}> = [
  {
    chainId: DexChainId.SEPOLIA,
    name: "Sepolia",
    symbol: "SEP_ETH",
    logo: "/chains/sepolia.svg",
  },
  {
    chainId: DexChainId.BSC_TESTNET,
    name: "BSC Testnet",
    symbol: "BSC",
    logo: "/chains/bsc.svg",
  },
  {
    chainId: DexChainId.EOS_TESTNET,
    name: "EOS Testnet",
    symbol: "EOS",
    logo: "/chains/eos.svg",
  },
];
