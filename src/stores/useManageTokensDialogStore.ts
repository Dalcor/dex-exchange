import { create } from "zustand";

type ManageTokensTab = "lists" | "tokens";
interface ManageTokensDialogStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeTab: ManageTokensTab;
  setActiveTab: (activeTab: ManageTokensTab) => void;
}

export const useManageTokensDialogStore = create<ManageTokensDialogStore>((set, get) => ({
  isOpen: false,
  activeTab: "lists",

  setIsOpen: (isOpen) => set({ isOpen }),
  setActiveTab: (activeTab) => set({ activeTab }),
}));
