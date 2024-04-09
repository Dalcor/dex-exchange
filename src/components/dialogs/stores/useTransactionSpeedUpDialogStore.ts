import { create } from "zustand";

import { IRecentTransaction } from "@/stores/useRecentTransactionsStore";

interface WalletDialogStore {
  transaction: IRecentTransaction | null;
  isOpen: boolean;
  handleSpeedUp: (transaction: IRecentTransaction) => void;
  handleClose: () => void;
}

export const useTransactionSpeedUpDialogStore = create<WalletDialogStore>((set, get) => ({
  transaction: null,
  isOpen: false,
  handleSpeedUp: (transaction) => set({ transaction, isOpen: true }),
  handleClose: () => set({ isOpen: false }),
}));
