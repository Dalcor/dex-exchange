import { create } from "zustand";

interface ConfirmSwapDialogStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useConfirmSwapDialogStore = create<ConfirmSwapDialogStore>((set, get) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
}));
