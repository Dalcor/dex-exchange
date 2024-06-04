import { Address } from "viem";
import { create } from "zustand";

import { Pool } from "@/sdk_hybrid/entities/pool";

interface PoolsStore {
  pools: Pool[];
  setPools: (pools: Pool[]) => void;
  addPool: (pool: Pool) => void;
}

export const usePoolsStore = create<PoolsStore>((set, get) => ({
  pools: [],
  setPools: (pools) => set({ pools }),
  addPool: (pool) => set({ pools: [...get().pools, pool] }),
}));

type PoolAddress = {
  isLoading: boolean;
  address?: Address;
};
export type PoolAddresses = {
  [key: string]: PoolAddress;
};
interface PoolAddressesStore {
  addresses: PoolAddresses;
  addPoolAddress: (key: string, address: PoolAddress) => void;
}

export const usePoolAddresses = create<PoolAddressesStore>((set, get) => ({
  addresses: {},
  addPoolAddress: (key, address) => set({ addresses: { ...get().addresses, [key]: address } }),
}));
