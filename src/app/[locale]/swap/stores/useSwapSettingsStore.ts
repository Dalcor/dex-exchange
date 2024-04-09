import { create } from "zustand";

interface SwapSettingsStore {
  slippage: number;
  deadline: number;
  setSlippage: (slippage: number) => void;
  setDeadline: (deadline: number) => void;
}

export const useSwapSettingsStore = create<SwapSettingsStore>((set, get) => ({
  slippage: 0.5,
  deadline: 20,

  setSlippage: (slippage) => set({ slippage }),
  setDeadline: (deadline) => set({ deadline }),
}));
