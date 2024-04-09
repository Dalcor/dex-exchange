import { Address } from "viem";

import { NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/sdk/addresses";
import { DexChainId } from "@/sdk/chains";

export const nonFungiblePositionManagerAddress: Address =
  NONFUNGIBLE_POSITION_MANAGER_ADDRESS[DexChainId.SEPOLIA];
