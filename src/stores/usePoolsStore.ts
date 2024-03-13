import { create } from "zustand";

import { Pool } from "@/sdk/entities/pool";

interface ManageTokensDialogStore {
  pools: Pool[];
  setPools: (pools: Pool[]) => void;
  addPool: (pool: Pool) => void;
}

export const usePoolsStore = create<ManageTokensDialogStore>((set, get) => ({
  pools: [],
  setPools: (pools) => set({ pools }),
  addPool: (pool) => set({ pools: [...get().pools, pool] }),
}));
