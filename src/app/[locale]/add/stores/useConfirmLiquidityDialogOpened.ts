import { create } from "zustand";

interface ConfirmLiquidityDialogStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useConfirmLiquidityDialogStore = create<ConfirmLiquidityDialogStore>((set, get) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
}));
