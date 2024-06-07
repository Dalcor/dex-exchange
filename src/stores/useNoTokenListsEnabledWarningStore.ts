import { create } from "zustand";

type NoTokenListsEnabledWarningStore = {
  isOpened: boolean;
  title: string;
  openNoTokenListsEnabledWarning: () => void;
  closeNoTokenListsEnabledWarning: () => void;
};

export const useNoTokenListsEnabledWarningStore = create<NoTokenListsEnabledWarningStore>()(
  (set, get) => ({
    isOpened: false,
    title: "The functionality of the exchange is limited, please enable at least one token list",
    openNoTokenListsEnabledWarning: () => set({ isOpened: true }),
    closeNoTokenListsEnabledWarning: () => set({ isOpened: false }),
  }),
);
