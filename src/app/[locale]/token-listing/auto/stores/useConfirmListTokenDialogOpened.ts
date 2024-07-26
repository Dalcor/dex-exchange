import { create } from "zustand";

interface ConfirmListTokenDialogStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useConfirmListTokenDialogStore = create<ConfirmListTokenDialogStore>((set, get) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
}));
