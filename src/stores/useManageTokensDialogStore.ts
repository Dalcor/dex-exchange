import { create } from "zustand";

type ManageTokensTab = number;
interface ManageTokensDialogStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeTab: ManageTokensTab;
  setActiveTab: (activeTab: ManageTokensTab) => void;
}

export const useManageTokensDialogStore = create<ManageTokensDialogStore>((set, get) => ({
  isOpen: false,
  activeTab: 0,

  setIsOpen: (isOpen) => set({ isOpen }),
  setActiveTab: (activeTab) => set({ activeTab }),
}));
