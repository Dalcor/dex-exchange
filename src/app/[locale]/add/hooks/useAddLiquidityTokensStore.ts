import { WrappedToken } from "@/config/types/WrappedToken";
import { create } from "zustand";

interface AddLiquidityTokensStore {
  tokenA: WrappedToken | undefined,
  tokenB: WrappedToken | undefined,
  setTokenA: (token: WrappedToken | undefined) => void,
  setTokenB: (token: WrappedToken | undefined) => void
}

export const useAddLiquidityTokensStore = create<AddLiquidityTokensStore>((set, get) => ({
  tokenA: undefined,
  tokenB: undefined,

  setTokenA: (tokenA) => set({tokenA}),
  setTokenB: (tokenB) => set({tokenB}),
}));
