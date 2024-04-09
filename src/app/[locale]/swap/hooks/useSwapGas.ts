import { useCallback, useEffect, useState } from "react";
import { useAccount, useBlockNumber, useEstimateFeesPerGas, useGasPrice } from "wagmi";

import {
  GasOption,
  GasSettings,
  useSwapGasSettingsStore,
} from "@/app/[locale]/swap/stores/useSwapGasSettingsStore";
import { GasFeeModel } from "@/stores/useRecentTransactionsStore";

function useFees() {
  const { chainId } = useAccount();

  const { data: estimatedFeesPerGasEIP1559, refetch: refetchEIP1559 } = useEstimateFeesPerGas({
    chainId,
    type: "eip1559",
  });
  const { data: estimatedFeesPerGasLegacy, refetch: refetchLegacy } = useEstimateFeesPerGas({
    chainId,
    type: "legacy",
  });

  const { data: gasPrice, refetch: refetchGasPrice } = useGasPrice({ chainId });

  const { data: blockNumber } = useBlockNumber();

  useEffect(() => {
    refetchLegacy();
    refetchEIP1559();
    refetchGasPrice();
  }, [blockNumber, refetchLegacy, refetchEIP1559, refetchGasPrice]);

  return {
    estimatedGasPriceLegacy: estimatedFeesPerGasLegacy?.gasPrice,
    estimatedMaxFeePerGas: estimatedFeesPerGasEIP1559?.maxFeePerGas,
    estimatedMaxPriorityFeePerGas: estimatedFeesPerGasEIP1559?.maxPriorityFeePerGas,
    currentGasPrice: gasPrice,
  };
}

type HandleApplyArgs =
  | { option: GasOption.CHEAP }
  | { option: GasOption.FAST }
  | { option: GasOption.CUSTOM; gasSettings: GasSettings };
export default function useSwapGas() {
  const {
    estimatedGasPriceLegacy,
    estimatedMaxPriorityFeePerGas,
    estimatedMaxFeePerGas,
    currentGasPrice,
  } = useFees();

  const { gasOption, setGasPrice, setGasOption, setGasLimit, gasPrice } = useSwapGasSettingsStore();

  useEffect(() => {
    if (gasOption === GasOption.CHEAP) {
      if (!estimatedMaxFeePerGas || !estimatedMaxPriorityFeePerGas) {
        return;
      }

      setGasPrice({
        model: GasFeeModel.EIP1559,
        maxFeePerGas: estimatedMaxFeePerGas,
        maxPriorityFeePerGas: estimatedMaxPriorityFeePerGas,
      });
    }
  }, [estimatedMaxFeePerGas, estimatedMaxPriorityFeePerGas, gasOption, setGasPrice]);

  const handleApply = useCallback(
    (args: HandleApplyArgs) => {
      if (!estimatedMaxFeePerGas || !estimatedMaxPriorityFeePerGas) {
        return;
      }

      const { option } = args;

      setGasOption(option);

      if (option === GasOption.CHEAP) {
        setGasPrice({
          model: GasFeeModel.EIP1559,
          maxFeePerGas: estimatedMaxFeePerGas,
          maxPriorityFeePerGas: estimatedMaxPriorityFeePerGas,
        });
      }

      if (option === GasOption.FAST) {
        setGasPrice({
          model: GasFeeModel.EIP1559,
          maxFeePerGas: estimatedMaxFeePerGas,
          maxPriorityFeePerGas: estimatedMaxPriorityFeePerGas * BigInt(2),
        });
      }

      if (option === GasOption.CUSTOM) {
        setGasPrice(args.gasSettings);
      }
    },
    [estimatedMaxFeePerGas, estimatedMaxPriorityFeePerGas, setGasOption, setGasPrice],
  );

  return {
    estimatedMaxFeePerGas,
    estimatedMaxPriorityFeePerGas,
    handleApply,
    estimatedGasPriceLegacy,
    gasPrice,
  };
}
