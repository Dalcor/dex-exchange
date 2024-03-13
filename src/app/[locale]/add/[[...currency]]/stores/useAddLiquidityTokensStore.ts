import { create } from "zustand";

import { WrappedToken } from "@/config/types/WrappedToken";

interface AddLiquidityTokensStore {
  tokenA: WrappedToken | undefined;
  tokenB: WrappedToken | undefined;
  setTokenA: (token: WrappedToken | undefined) => void;
  setTokenB: (token: WrappedToken | undefined) => void;
  setBothTokens: ({
    tokenA,
    tokenB,
  }: {
    tokenA: WrappedToken | undefined;
    tokenB: WrappedToken | undefined;
  }) => void;
}

export const useAddLiquidityTokensStore = create<AddLiquidityTokensStore>((set, get) => ({
  tokenA: undefined,
  tokenB: undefined,

  setTokenA: (token) =>
    set((state) => {
      const newToken = state.tokenB && token?.equals(state.tokenB) ? undefined : token;
      const newPath = `/en/add/${newToken?.address}/${state.tokenB?.address}`;
      window.history.replaceState(null, "", newPath);
      return {
        tokenA: newToken,
      };
    }),
  setTokenB: (token) =>
    set((state) => {
      const newToken = state.tokenA && token?.equals(state.tokenA) ? undefined : token;
      // const newPath = `/en/add/${state.tokenA?.address}/${newToken?.address}`;
      // window.history.replaceState(null, "", newPath);
      return {
        tokenB: newToken,
      };
    }),
  setBothTokens: ({ tokenA, tokenB }) =>
    set(() => {
      const newTokenB = tokenA && tokenB?.equals(tokenA) ? undefined : tokenB;
      // const newPath = `/en/add/${tokenA?.address}/${newTokenB?.address}`;
      // window.history.replaceState(null, "", newPath);
      return {
        tokenA,
        tokenB: newTokenB,
      };
    }),
}));
