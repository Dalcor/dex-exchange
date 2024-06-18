import { Address } from "viem";
import { create } from "zustand";

import { Pool } from "@/sdk_hybrid/entities/pool";

interface PoolsStore {
  pools: {
    [key: string]: Pool;
  };
  addPool: (key: string, pool: Pool) => void;
  getPool: (key: string) => Pool | undefined;
}

export const usePoolsStore = create<PoolsStore>((set, get) => ({
  pools: {},
  addPool: (key, pool) => set({ pools: { ...get().pools, [key]: pool } }),
  getPool: (key) => get().pools[key],
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
