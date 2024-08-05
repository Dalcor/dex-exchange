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
  APPROVE_ERROR,
}

export enum SwapError {
  OUT_OF_GAS,
  UNKNOWN,
}

interface SwapStatusStore {
  status: SwapStatus;
  approveHash: Address | undefined;
  swapHash: Address | undefined;
  errorType: SwapError;

  setStatus: (status: SwapStatus) => void;
  setErrorType: (errorType: SwapError) => void;
  setApproveHash: (hash: Address) => void;
  setSwapHash: (hash: Address) => void;
}

export const useSwapStatusStore = create<SwapStatusStore>((set, get) => ({
  status: SwapStatus.INITIAL,
  approveHash: undefined,
  swapHash: undefined,
  errorType: SwapError.UNKNOWN,

  setStatus: (status) => {
    if (status === SwapStatus.INITIAL) {
      set({ status, swapHash: undefined, approveHash: undefined });
    }

    set({ status });
  },
  setErrorType: (errorType) => set({ errorType }),
  setSwapHash: (hash) => set({ swapHash: hash }),
  setApproveHash: (hash) => set({ approveHash: hash }),
}));
