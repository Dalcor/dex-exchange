import { networks } from "@/config/networks";
import { DexChainId } from "@/sdk_hybrid/chains";

export const getChainSymbol = (chainId: DexChainId) => {
  const network = networks.find((n) => n.chainId === chainId);
  return network?.symbol as string;
};
