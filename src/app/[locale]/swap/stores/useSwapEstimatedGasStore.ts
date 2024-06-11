import { create } from "zustand";

interface SwapEstimatedGasStore {
  estimatedGas: bigint;
  estimatedGasId: string | undefined;
  setEstimatedGas: (estimatedGas: bigint | undefined) => void;
  setEstimatedGasId: (estimatedGasId: string | undefined) => void;
}

export const useSwapEstimatedGasStore = create<SwapEstimatedGasStore>()((set, get) => ({
  estimatedGas: BigInt(0),
  estimatedGasId: undefined,
  setEstimatedGas: (estimatedGas) => set({ estimatedGas }),
  setEstimatedGasId: (estimatedGasId) => set({ estimatedGasId }),
}));
