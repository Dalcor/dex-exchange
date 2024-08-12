import { useMemo } from "react";
import { create } from "zustand";

export enum EstimatedGasId {
  "mint",
}

interface EstimatedGasStore {
  estimatedGas: Record<EstimatedGasId, bigint>;
  setEstimatedGas: ({
    estimatedGasId,
    estimatedGas,
  }: {
    estimatedGasId: EstimatedGasId;
    estimatedGas: bigint | undefined;
  }) => void;
}

// TODO: specify gas estimation type (mint or anything else)
export const useEstimatedGasStore = create<EstimatedGasStore>()((set, get) => ({
  estimatedGas: {
    [EstimatedGasId.mint]: BigInt(530000),
  },
  setEstimatedGas: ({ estimatedGasId, estimatedGas }) =>
    set({ estimatedGas: { [estimatedGasId]: estimatedGas || BigInt(0) } }),
}));

export const useEstimatedGasStoreById = (estimatedGasId: EstimatedGasId) => {
  const { estimatedGas } = useEstimatedGasStore();

  const estimatedGasById = useMemo(() => {
    return estimatedGas[estimatedGasId];
  }, [estimatedGas, estimatedGasId]);

  return estimatedGasById;
};
