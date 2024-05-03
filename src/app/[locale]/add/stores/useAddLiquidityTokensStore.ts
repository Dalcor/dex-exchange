import { create } from "zustand";

import { Token } from "@/sdk_hybrid/entities/token";

interface AddLiquidityTokensStore {
  tokenA: Token | undefined;
  tokenB: Token | undefined;
  setTokenA: (token: Token | undefined) => void;
  setTokenB: (token: Token | undefined) => void;
  setBothTokens: ({
    tokenA,
    tokenB,
  }: {
    tokenA: Token | undefined;
    tokenB: Token | undefined;
  }) => void;
}

export const useAddLiquidityTokensStore = create<AddLiquidityTokensStore>((set, get) => ({
  tokenA: undefined,
  tokenB: undefined,

  setTokenA: (token) =>
    set((state) => {
      const newToken = state.tokenB && token?.equals(state.tokenB) ? undefined : token;
      // const newPath = `/en/add/${newToken?.address0}/${state.tokenB?.address0}`;
      // window.history.replaceState(null, "", newPath);
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
