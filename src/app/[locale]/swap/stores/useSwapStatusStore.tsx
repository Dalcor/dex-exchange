import { Address } from "viem";
import { create } from "zustand";

export enum SwapStatus {
  INITIAL,
  PENDING_APPROVE,
  LOADING_APPROVE,
  PENDING,
  LOADING,
  SUCCESS,
  ERROR,
}

interface SwapStatusStore {
  status: SwapStatus;
  approveHash: Address | undefined;
  swapHash: Address | undefined;

  setStatus: (status: SwapStatus) => void;
  setApproveHash: (hash: Address) => void;
  setSwapHash: (hash: Address) => void;
}

export const useSwapStatusStore = create<SwapStatusStore>((set, get) => ({
  status: SwapStatus.INITIAL,
  approveHash: undefined,
  swapHash: undefined,

  setStatus: (status) => {
    if (status === SwapStatus.INITIAL) {
      set({ status, swapHash: undefined, approveHash: undefined });
    }

    set({ status });
  },
  setSwapHash: (hash) => set({ swapHash: hash }),
  setApproveHash: (hash) => set({ approveHash: hash }),
}));
