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

interface SwapGasPriceSettingsStore {
  gasPriceOption: GasOption;
  gasPriceSettings: GasSettings;
  setGasPriceOption: (gasOption: GasOption) => void;
  setGasPriceSettings: (gasSettings: GasSettings) => void;
}
export const useSwapGasPriceStore = create<SwapGasPriceSettingsStore>((set, get) => ({
  gasPriceOption: GasOption.CHEAP,
  gasPriceSettings: {
    model: GasFeeModel.EIP1559,
    maxFeePerGas: undefined,
    maxPriorityFeePerGas: undefined,
  },
  setGasPriceOption: (gasPriceOption) => set({ gasPriceOption }),
  setGasPriceSettings: (gasPriceSettings) => set({ gasPriceSettings }),
}));

interface SwapGasLimitSettingsStore {
  customGasLimit: bigint | undefined;
  estimatedGas: bigint;
  setCustomGasLimit: (customGas: bigint | undefined) => void;
  setEstimatedGas: (estimatedGas: bigint) => void;
}
export const useSwapGasLimitStore = create<SwapGasLimitSettingsStore>((set, get) => ({
  customGasLimit: undefined,
  estimatedGas: BigInt(0),
  setCustomGasLimit: (gasLimit) => set({ customGasLimit: gasLimit }),
  setEstimatedGas: (estimatedGas) => set({ estimatedGas }),
}));

interface SwapGasSettingsStore {
  isAdvanced: boolean;
  setIsAdvanced: (isAdvanced: boolean) => void;
}

export const useSwapGasSettingsStore = create<SwapGasSettingsStore>((set, get) => ({
  isAdvanced: false,
  setIsAdvanced: (isAdvanced) => set({ isAdvanced }),
}));
