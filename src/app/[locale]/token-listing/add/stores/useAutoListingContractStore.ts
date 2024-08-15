import { Address } from "viem";
import { create } from "zustand";

import { Token } from "@/sdk_hybrid/entities/token";

interface AutoListingContractStore {
  autoListingContract: Address | undefined;
  setAutoListingContract: (autoListingContract: Address | undefined) => void;
  reset: () => void;
}

export const useAutoListingContractStore = create<AutoListingContractStore>((set, get) => ({
  autoListingContract: undefined,

  setAutoListingContract: (autoListingContract) => set({ autoListingContract }),

  reset: () =>
    set({
      autoListingContract: undefined,
    }),
}));
