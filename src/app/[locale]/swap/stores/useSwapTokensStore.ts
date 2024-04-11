import { Address } from "viem";
import { create } from "zustand";

import { Token } from "@/sdk_hybrid/entities/token";

interface SwapTokensStore {
  tokenA: Token | undefined;
  tokenB: Token | undefined;
  setTokenA: (token: Token | undefined) => void;
  setTokenB: (token: Token | undefined) => void;
  tokenAAddress: Address | undefined;
  tokenBAddress: Address | undefined;
  setTokenAAddress: (address: Address | undefined) => void;
  setTokenBAddress: (address: Address | undefined) => void;
}

export const useSwapTokensStore = create<SwapTokensStore>((set, get) => ({
  tokenA: undefined,
  tokenB: undefined,
  tokenAAddress: undefined,
  tokenBAddress: undefined,

  setTokenA: (tokenA) => set({ tokenA }),
  setTokenB: (tokenB) => set({ tokenB }),

  setTokenAAddress: (tokenAAddress) => set({ tokenAAddress }),
  setTokenBAddress: (tokenBAddress) => set({ tokenBAddress }),
}));
