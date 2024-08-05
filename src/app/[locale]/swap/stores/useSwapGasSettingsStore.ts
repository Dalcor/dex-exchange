import { create } from "zustand";

import { GasFeeModel } from "@/stores/useRecentTransactionsStore";

export type GasSettings =
  | {
      model: GasFeeModel.EIP1559;
      maxFeePerGas: bigint | undefined;
      maxPriorityFeePerGas: bigint | undefined;
    }
  | {
      model: GasFeeModel.LEGACY;
      gasPrice: bigint | undefined;
    };

export enum GasOption {
  CHEAP,
  FAST,
  CUSTOM,
}

interface SwapGasSettingsStore {
  gasOption: GasOption;
  gasPrice: GasSettings;
  gasLimit: bigint;
  estimatedGas: bigint;
  setEstimatedGas: (estimatedGas: bigint) => void;
  setGasOption: (gasOption: GasOption) => void;
  setGasLimit: (gasLimit: bigint) => void;
  setGasPrice: (gasPrice: GasSettings) => void;
}

export const useSwapGasSettingsStore = create<SwapGasSettingsStore>((set, get) => ({
  gasOption: GasOption.CHEAP,
  gasPrice: {
    model: GasFeeModel.EIP1559,
    maxFeePerGas: undefined,
    maxPriorityFeePerGas: undefined,
  },
  gasLimit: BigInt(0),
  estimatedGas: BigInt(0),
  setGasLimit: (gasLimit) => set({ gasLimit }),
  setEstimatedGas: (estimatedGas) => set({ estimatedGas }),
  setGasOption: (gasOption) => set({ gasOption }),
  setGasPrice: (gasPrice) => set({ gasPrice }),
}));
