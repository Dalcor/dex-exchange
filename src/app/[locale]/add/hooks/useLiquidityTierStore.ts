import { create } from "zustand";

import { FeeAmount } from "@/sdk";

interface LiquidityTierStore {
  tier: FeeAmount;
  setTier: (tier: FeeAmount) => void;
}

export const useLiquidityTierStore = create<LiquidityTierStore>((set, get) => ({
  tier: FeeAmount.MEDIUM,

  setTier: (tier) => set({ tier }),
}));
