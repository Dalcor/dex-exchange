import { DexChainId } from "@/sdk_hybrid/chains";

import { Token } from "./token";

/**
 * Known WETH9 implementation addresses, used in our implementation of Ether#wrapped
 */
export const WETH9: Record<DexChainId, Token> = {
  [DexChainId.CALLISTO]: new Token(
    1,
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    18,
    "WETH",
    "Wrapped Ether",
  ),
  [DexChainId.SEPOLIA]: new Token(
    1,
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    18,
    "WETH",
    "Wrapped Ether",
  ),
};
