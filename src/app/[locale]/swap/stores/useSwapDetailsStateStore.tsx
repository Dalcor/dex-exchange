import { create } from "zustand";

interface SwapDetailsStateStore {
  isDetailsExpanded: boolean;
  isPriceInverted: boolean;
  setIsDetailsExpanded: (isDetailsExpanded: boolean) => void;
  setIsPriceInverted: (isPriceInverted: boolean) => void;
}

export const useSwapDetailsStateStore = create<SwapDetailsStateStore>((set, get) => ({
  isDetailsExpanded: false,
  isPriceInverted: false,
  setIsDetailsExpanded: (isDetailsExpanded) => set({ isDetailsExpanded }),
  setIsPriceInverted: (isPriceInverted) => set({ isPriceInverted }),
}));
