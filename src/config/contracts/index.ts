import { Address } from "viem";

import { NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/sdk_hybrid/addresses";
import { DexChainId } from "@/sdk_hybrid/chains";

export const nonFungiblePositionManagerAddress: Address =
  NONFUNGIBLE_POSITION_MANAGER_ADDRESS[DexChainId.SEPOLIA];
