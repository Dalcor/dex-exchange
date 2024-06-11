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
  setStatus: (status: SwapStatus) => void;
}

export const useSwapStatusStore = create<SwapStatusStore>((set, get) => ({
  status: SwapStatus.INITIAL,
  setStatus: (status) => set({ status }),
}));
