import { create } from "zustand";

interface TransactionSettingsStore {
  slippage: number,
  deadline: number,
  setSlippage: (slippage: number) => void,
  setDeadline: (deadline: number) => void,
}

export const useTransactionSettingsStore = create<TransactionSettingsStore>((set, get) => ({
  slippage: 0.5,
  deadline: 20,

  setSlippage: (slippage) => set({slippage}),
  setDeadline: (deadline) => set({deadline}),
}));
