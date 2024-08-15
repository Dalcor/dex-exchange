import { create } from "zustand";

import { Token } from "@/sdk_hybrid/entities/token";

interface ListTokensStore {
  tokenA: Token | undefined;
  tokenB: Token | undefined;
  setTokenA: (token: Token | undefined) => void;
  setTokenB: (token: Token | undefined) => void;
  reset: () => void;
}

export const useListTokensStore = create<ListTokensStore>((set, get) => ({
  tokenA: undefined,
  tokenB: undefined,

  setTokenA: (tokenA) => set({ tokenA }),
  setTokenB: (tokenB) => set({ tokenB }),

  reset: () =>
    set({
      tokenA: undefined,
      tokenB: undefined,
    }),
}));
