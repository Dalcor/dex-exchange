import { create } from "zustand";

type UnknownNetworkWarningStore = {
  isOpened: boolean;
  title: string;
  openNoTokenListsEnabledWarning: () => void;
  closeNoTokenListsEnabledWarning: () => void;
};

export const useUnknownNetworkWarningStore = create<UnknownNetworkWarningStore>()((set, get) => ({
  isOpened: false,
  title: "This network is not supported",
  openNoTokenListsEnabledWarning: () => set({ isOpened: true }),
  closeNoTokenListsEnabledWarning: () => set({ isOpened: false }),
}));
