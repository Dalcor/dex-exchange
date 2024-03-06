import { create } from "zustand";

interface WalletDialogStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeTab: 0 | 1;
  setActiveTab: (activeTab: 0 | 1) => void;
}

export const useWalletDialogStore = create<WalletDialogStore>((set, get) => ({
  isOpen: false,
  activeTab: 0,

  setIsOpen: (isOpen) => set({ isOpen }),
  setActiveTab: (activeTab) => set({ activeTab }),
}));
