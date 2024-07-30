import { bscTestnetDefaultList } from "@/db/lists/bsc-testnet-default-list";
import { eosTestnetDefaultList } from "@/db/lists/eos-testnet-default-list";
import { sepoliaDefaultList } from "@/db/lists/sepolia-default-list";
import { DexChainId } from "@/sdk_hybrid/chains";

export const defaultLists: Record<DexChainId, any> = {
  [DexChainId.SEPOLIA]: sepoliaDefaultList,
  // [DexChainId.CALLISTO]: callistoDefaultList,
  [DexChainId.BSC_TESTNET]: bscTestnetDefaultList,
  [DexChainId.EOS_TESTNET]: eosTestnetDefaultList,
};
