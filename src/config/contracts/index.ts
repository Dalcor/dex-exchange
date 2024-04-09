import { Address } from "viem";

import { CHAIN_TO_ADDRESSES_MAP } from "@/sdk/addresses";
import { ChainId } from "@/sdk/chains";

export const nonFungiblePositionManagerAddress: Address = CHAIN_TO_ADDRESSES_MAP[ChainId.SEPOLIA]
  .nonfungiblePositionManagerAddress as Address;

// export const tokenConverterAddress: Address = "0x258E392A314034eb093706254960f26A90696D4c";
