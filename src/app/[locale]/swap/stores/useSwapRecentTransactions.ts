import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SwapRecentTransactionsStore {
  isOpened: boolean;
  setIsOpened: (isOpened: boolean) => void;
}

const localStorageKey = "swap-recent-transactions-state";

export const useSwapRecentTransactionsStore = create<SwapRecentTransactionsStore>()(
  persist(
    (set, get) => ({
      isOpened: false,
      setIsOpened: (isOpened) => set({ isOpened }),
    }),
    {
      name: localStorageKey, // name of the item in the storage (must be unique)
    },
  ),
);
