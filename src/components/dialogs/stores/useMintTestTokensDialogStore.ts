import { create } from "zustand";

import { Token } from "@/sdk_hybrid/entities/token";

interface MintTestTokensDialogStore {
  isOpen: boolean;
  handleOpen: () => void;
  handleClose: () => void;
}

export const useMintTestTokensDialogStore = create<MintTestTokensDialogStore>((set, get) => ({
  isOpen: false,
  handleOpen: () => set({ isOpen: true }),
  handleClose: () => set({ isOpen: false }),
}));
