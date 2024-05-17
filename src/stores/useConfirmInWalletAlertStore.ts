import { create } from "zustand";

type ConfirmInWalletAlertStore = {
  isOpened: boolean;
  title: string;
  description: string;
  openConfirmInWalletAlert: (description: string, title?: string) => void;
  closeConfirmInWalletAlert: () => void;
};

export const useConfirmInWalletAlertStore = create<ConfirmInWalletAlertStore>()((set, get) => ({
  isOpened: false,
  title: "",
  description: "",
  openConfirmInWalletAlert: (description, title = "Confirm operation in your wallet") =>
    set({ isOpened: true, title, description }),
  closeConfirmInWalletAlert: () => set({ isOpened: false, title: "", description: "" }),
}));
