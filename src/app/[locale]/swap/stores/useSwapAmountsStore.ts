import { create } from "zustand";

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
}

export const useSwapAmountsStore = create<LiquidityAmountsStore>((set, get) => ({
  independentField: Field.CURRENCY_A,
  dependentField: Field.CURRENCY_B,
  typedValue: "2",
  setTypedValue: ({ field, typedValue }) => {
    set({
      independentField: field,
      dependentField: field === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A,
      typedValue,
    });
  },
}));
