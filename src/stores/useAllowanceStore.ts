import { Address } from "viem";
import { create } from "zustand";

import { DexChainId } from "@/sdk_hybrid/chains";

export enum AllowanceStatus {
  INITIAL,
  PENDING,
  LOADING,
  SUCCESS,
}

type AllowanceItem = {
  tokenAddress: Address;
  contractAddress: Address;
  allowedToSpend: bigint;
  account: Address;
  chainId: DexChainId;
  blockNumber: bigint;
  hash?: Address;
};

interface AllowanceStore {
  allowances: AllowanceItem[];
  addAllowanceItem: (item: AllowanceItem) => void;
  updateAllowedToSpend: (item: AllowanceItem, allowedToSpend: bigint, blockNumber: bigint) => void;
}

export const useAllowanceStore = create<AllowanceStore>((set, get) => ({
  allowances: [],
  addAllowanceItem: (item) => set({ allowances: [...get().allowances, item] }),
  updateAllowedToSpend: (item, allowedToSpend, blockNumber) =>
    set({
      allowances: get().allowances.map((allowance) =>
        allowance.tokenAddress === item.tokenAddress &&
        allowance.contractAddress === item.contractAddress &&
        allowance.account === item.account &&
        allowance.chainId === item.chainId
          ? { ...allowance, allowedToSpend, blockNumber }
          : allowance,
      ),
    }),
}));
