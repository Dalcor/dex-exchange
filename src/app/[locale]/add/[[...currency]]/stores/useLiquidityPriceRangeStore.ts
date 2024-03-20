import { create } from "zustand";

import { Bound } from "../components/PriceRange/LiquidityChartRangeInput/types";
import { FullRange } from "./useAddLiquidityAmountsStore";

type Ticks = {
  [Bound.LOWER]?: number;
  [Bound.UPPER]?: number;
};
interface LiquidityPriceRangeStore {
  leftRangeTypedValue: string | FullRange;
  rightRangeTypedValue: string | FullRange;
  ticks: Ticks;
  setLeftRangeTypedValue: (leftRangeTypedValue: string | FullRange) => void;
  setRightRangeTypedValue: (rightRangeTypedValue: string | FullRange) => void;
  setFullRange: () => void;
  clearRangeTypedValues: () => void;
  clearPriceRange: () => void;
  setTicks: (ticks: Ticks) => void;
}

export const useLiquidityPriceRangeStore = create<LiquidityPriceRangeStore>((set, get) => ({
  leftRangeTypedValue: "",
  rightRangeTypedValue: "",
  ticks: {
    [Bound.LOWER]: undefined,
    [Bound.UPPER]: undefined,
  },

  setLeftRangeTypedValue: (leftRangeTypedValue) => set({ leftRangeTypedValue }),
  setRightRangeTypedValue: (rightRangeTypedValue) => set({ rightRangeTypedValue }),
  setFullRange: () =>
    set({
      leftRangeTypedValue: true,
      rightRangeTypedValue: true,
    }),
  clearRangeTypedValues: () =>
    set({
      leftRangeTypedValue: "",
      rightRangeTypedValue: "",
    }),
  clearPriceRange: () =>
    set({
      leftRangeTypedValue: "",
      rightRangeTypedValue: "",
      ticks: {
        [Bound.LOWER]: undefined,
        [Bound.UPPER]: undefined,
      },
    }),
  setTicks: (ticks) => set({ ticks }),
}));
