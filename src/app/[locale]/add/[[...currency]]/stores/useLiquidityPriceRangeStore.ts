import { create } from "zustand";

import { Bound } from "@/app/[locale]/add/[[...currency]]/components/PriceRange/LiquidityChartRangeInput/types";

type Ticks = {
  [Bound.LOWER]?: number;
  [Bound.UPPER]?: number;
};
interface LiquidityPriceRangeStore {
  leftRangeTypedValue: string;
  rightRangeTypedValue: string;
  setLeftRangeTypedValue: (leftRangeTypedValue: string) => void;
  setRightRangeTypedValue: (rightRangeTypedValue: string) => void;
  ticks: Ticks;
  setTicks: (ticks: Ticks) => void;
}

export const useLiquidityPriceRangeStore = create<LiquidityPriceRangeStore>((set, get) => ({
  leftRangeTypedValue: "0.95",
  rightRangeTypedValue: "1.05",
  ticks: {
    [Bound.LOWER]: undefined,
    [Bound.UPPER]: undefined,
  },

  setLeftRangeTypedValue: (leftRangeTypedValue) => set({ leftRangeTypedValue }),
  setRightRangeTypedValue: (rightRangeTypedValue) => set({ rightRangeTypedValue }),
  setTicks: (ticks) => set({ ticks }),
}));
