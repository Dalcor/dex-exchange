import { Address } from "viem";
import { create } from "zustand";

export enum LiquidityStatus {
  INITIAL,
  APPROVE_PENDING,
  APPROVE_LOADING,
  APPROVE_ERROR,
  MINT,
  MINT_PENDING,
  MINT_LOADING,
  MINT_ERROR,
  SUCCESS,
}

interface LiquidityStatusStore {
  status: LiquidityStatus;
  approveHash: Address | undefined;
  liquidityHash: Address | undefined;

  setStatus: (status: LiquidityStatus) => void;
  setApproveHash: (hash: Address) => void;
  setLiquidityHash: (hash: Address) => void;
}

export const useLiquidityStatusStore = create<LiquidityStatusStore>((set, get) => ({
  status: LiquidityStatus.INITIAL,
  approveHash: undefined,
  liquidityHash: undefined,

  setStatus: (status) => {
    if (status === LiquidityStatus.INITIAL) {
      set({ status, liquidityHash: undefined, approveHash: undefined });
    }

    set({ status });
  },
  setLiquidityHash: (hash) => set({ liquidityHash: hash }),
  setApproveHash: (hash) => set({ approveHash: hash }),
}));
