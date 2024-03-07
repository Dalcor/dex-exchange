import { create } from "zustand";

import { WrappedToken } from "@/config/types/WrappedToken";

interface SwapTokensStore {
  tokenA: WrappedToken | undefined;
  tokenB: WrappedToken | undefined;
  setTokenA: (token: WrappedToken | undefined) => void;
  setTokenB: (token: WrappedToken | undefined) => void;
}

export const useSwapTokensStore = create<SwapTokensStore>((set, get) => ({
  tokenA: undefined,
  tokenB: undefined,

  setTokenA: (tokenA) => set({ tokenA }),
  setTokenB: (tokenB) => set({ tokenB }),
}));
