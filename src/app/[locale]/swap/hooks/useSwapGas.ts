import { useCallback, useEffect } from "react";
import { useAccount, useBlockNumber, useEstimateFeesPerGas, useGasPrice } from "wagmi";

import {
  GasOption,
  GasSettings,
  useSwapGasSettingsStore,
} from "@/app/[locale]/swap/stores/useSwapGasSettingsStore";
import {
  baseFeeMultipliers,
  isEip1559Supported,
  SCALING_FACTOR,
} from "@/config/constants/baseFeeMultipliers";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import useDeepEffect from "@/hooks/useDeepEffect";
import { GasFeeModel } from "@/stores/useRecentTransactionsStore";

// TODO: cache with store. gasPrice, maxPriorityFeePerGas
export function useFees() {
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

  //TODO: check wagmi cache
  const { data: blockNumber } = useBlockNumber({
    scopeKey: "fees",
  });

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
  | { option: GasOption.CUSTOM; gasSettings: GasSettings; gasLimit: bigint };
export default function useSwapGas() {
  const {
    estimatedGasPriceLegacy,
    estimatedMaxPriorityFeePerGas,
    estimatedMaxFeePerGas,
    currentGasPrice,
  } = useFees();

  const chainId = useCurrentChainId();

  const { gasOption, setGasPrice, setGasOption, setGasLimit, gasPrice } = useSwapGasSettingsStore();

  console.log(gasPrice);

  useDeepEffect(() => {
    if (gasOption === GasOption.CHEAP) {
      if (gasPrice.model === GasFeeModel.EIP1559) {
        if (!gasPrice.maxFeePerGas && !gasPrice.maxPriorityFeePerGas) {
          console.log("INTIALIZE GAS PRICE");
          setGasPrice({
            model: GasFeeModel.EIP1559,
            maxFeePerGas: estimatedMaxFeePerGas,
            maxPriorityFeePerGas: estimatedMaxPriorityFeePerGas,
          });
        }
      }
    }
  }, [estimatedMaxFeePerGas, estimatedMaxPriorityFeePerGas, gasOption, gasPrice, setGasPrice]);

  const handleApply = useCallback(
    (args: HandleApplyArgs) => {
      if (!estimatedMaxFeePerGas || !estimatedMaxPriorityFeePerGas || !currentGasPrice) {
        return;
      }

      const { option } = args;

      setGasOption(option);

      if (option === GasOption.CUSTOM) {
        setGasPrice(args.gasSettings);
        setGasLimit(args.gasLimit);
      } else {
        const multiplier = baseFeeMultipliers[chainId][args.option];

        if (isEip1559Supported(chainId)) {
          setGasPrice({
            model: GasFeeModel.EIP1559,
            maxFeePerGas: (estimatedMaxFeePerGas * multiplier) / SCALING_FACTOR,
            maxPriorityFeePerGas: (estimatedMaxPriorityFeePerGas * multiplier) / SCALING_FACTOR,
          });
        } else {
          setGasPrice({
            model: GasFeeModel.LEGACY,
            gasPrice: (currentGasPrice * multiplier) / SCALING_FACTOR,
          });
        }
      }
    },
    [
      chainId,
      currentGasPrice,
      estimatedMaxFeePerGas,
      estimatedMaxPriorityFeePerGas,
      setGasLimit,
      setGasOption,
      setGasPrice,
    ],
  );

  return {
    estimatedMaxFeePerGas,
    estimatedMaxPriorityFeePerGas,
    handleApply,
    estimatedGasPriceLegacy,
    gasPrice,
  };
}