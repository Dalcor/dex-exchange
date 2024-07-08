import { create } from "zustand";

import { Token } from "@/sdk_hybrid/entities/token";
import { Standard } from "@/sdk_hybrid/standard";

interface SwapTokensStore {
  tokenA: Token | undefined;
  tokenB: Token | undefined;
  setTokenA: (token: Token | undefined) => void;
  setTokenB: (token: Token | undefined) => void;
  tokenAStandard: Standard;
  tokenBStandard: Standard;
  setTokenAStandard: (address: Standard) => void;
  setTokenBStandard: (address: Standard) => void;
  reset: () => void;
}

export const useSwapTokensStore = create<SwapTokensStore>((set, get) => ({
  tokenA: undefined,
  tokenB: undefined,
  tokenAAddress: undefined,
  tokenAStandard: Standard.ERC20,
  tokenBAddress: undefined,
  tokenBStandard: Standard.ERC20,

  setTokenA: (tokenA) => set({ tokenA }),
  setTokenB: (tokenB) => set({ tokenB }),

  setTokenAStandard: (tokenAStandard) => set({ tokenAStandard }),
  setTokenBStandard: (tokenBStandard) => set({ tokenBStandard }),
  reset: () =>
    set({
      tokenA: undefined,
      tokenB: undefined,
      tokenAStandard: Standard.ERC20,
      tokenBStandard: Standard.ERC20,
    }),
}));
