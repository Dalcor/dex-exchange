import { parseUnits } from "viem";
import { create } from "zustand";

interface LiquidityAmountsStore {
  amountA: bigint | null;
  amountB: bigint | null;
  amountAString: string;
  amountBString: string;
  setAmountA: (amount: string, decimals?: number) => void;
  setAmountB: (amount: string, decimals?: number) => void;
}

export const useLiquidityAmountsStore = create<LiquidityAmountsStore>((set, get) => ({
  amountA: null,
  amountB: null,
  amountAString: "",
  amountBString: "",
  setAmountA: (amount, decimals) => {
    const stringObj = { amountAString: amount };

    if (decimals) {
      return set({ amountA: parseUnits(amount, decimals), ...stringObj });
    }

    return set(stringObj);
  },
  setAmountB: (amount, decimals) => {
    const stringObj = { amountBString: amount };

    if (decimals) {
      return set({ amountB: parseUnits(amount, decimals), ...stringObj });
    }

    return set(stringObj);
  },
}));
