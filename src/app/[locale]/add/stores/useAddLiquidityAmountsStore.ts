import { create } from "zustand";

import { Standard } from "@/sdk_hybrid/standard";

export enum Field {
  CURRENCY_A = "CURRENCY_A",
  CURRENCY_B = "CURRENCY_B",
}

export type FullRange = true;

interface LiquidityAmountsStore {
  independentField: Field;
  typedValue: string;
  dependentField: Field;
  setTypedValue: (data: { typedValue: string; field: Field }) => void;
  tokenAStandardRatio: 0 | 100;
  tokenBStandardRatio: 0 | 100;
  setTokenAStandardRatio: (ratio: 0 | 100) => void;
  setTokenBStandardRatio: (ratio: 0 | 100) => void;
}

export const useLiquidityAmountsStore = create<LiquidityAmountsStore>((set, get) => ({
  independentField: Field.CURRENCY_A,
  dependentField: Field.CURRENCY_B,
  typedValue: "",
  tokenAStandardRatio: 0,
  tokenBStandardRatio: 0,
  setTokenAStandardRatio: (ratio) => {
    set({
      tokenAStandardRatio: ratio,
    });
  },
  setTokenBStandardRatio: (ratio) => {
    set({
      tokenBStandardRatio: ratio,
    });
  },
  setTypedValue: ({ field, typedValue }) => {
    set({
      independentField: field,
      dependentField: field === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A,
      typedValue,
    });
  },
}));

export const useTokensStandards = () => {
  const { tokenAStandardRatio, tokenBStandardRatio } = useLiquidityAmountsStore();

  const tokenAStandard = tokenAStandardRatio === 0 ? Standard.ERC20 : Standard.ERC223;
  const tokenBStandard = tokenBStandardRatio === 0 ? Standard.ERC20 : Standard.ERC223;

  return {
    tokenAStandard,
    tokenBStandard,
  };
};
