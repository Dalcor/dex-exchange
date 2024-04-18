import { create } from "zustand";

type ConfirmInWalletDialogStore = {
  isOpened: boolean;
  title: string;
  description: string;
  openConfirmInWalletDialog: (description: string, title?: string) => void;
  closeConfirmInWalletDialog: () => void;
};

export const useConfirmInWalletDialogStore = create<ConfirmInWalletDialogStore>()((set, get) => ({
  isOpened: false,
  title: "",
  description: "",
  openConfirmInWalletDialog: (description, title = "Confirm operation in your wallet") =>
    set({ isOpened: true, title, description }),
  closeConfirmInWalletDialog: () => set({ isOpened: false, title: "", description: "" }),
}));
