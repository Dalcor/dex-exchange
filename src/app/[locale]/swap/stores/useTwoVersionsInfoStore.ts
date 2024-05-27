import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TwoVersionsInfoStore {
  isOpened: boolean;
  setIsOpened: (isOpened: boolean) => void;
}

const localStorageKey = "two-versions-info-state";

export const useTwoVersionsInfoStore = create<TwoVersionsInfoStore>()(
  persist(
    (set, get) => ({
      isOpened: true,
      setIsOpened: (isOpened) => set({ isOpened }),
    }),
    {
      name: localStorageKey, // name of the item in the storage (must be unique)
    },
  ),
);
