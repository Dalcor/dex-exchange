import { DexChainId } from "@/sdk_hybrid/chains";

export const networks: Array<{
  chainId: DexChainId;
  name: string;
  logo: string;
}> = [
  {
    chainId: DexChainId.CALLISTO,
    name: "Callisto",
    logo: "/chains/callisto.svg",
  },
  {
    chainId: DexChainId.SEPOLIA,
    name: "Sepolia",
    logo: "/chains/sepolia.svg",
  },
];
