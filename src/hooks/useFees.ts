import { useEffect } from "react";
import { useAccount, useEstimateFeesPerGas } from "wagmi";

import useScopedBlockNumber from "@/hooks/useScopedBlockNumber";

export function useFees() {
  const { chainId } = useAccount();

  const { data: estimatedFeesPerGasEIP1559, refetch: refetchEIP1559 } = useEstimateFeesPerGas({
    chainId,
    type: "eip1559",
    scopeKey: `${chainId}-eip1559`,
  });
  const { data: estimatedFeesPerGasLegacy, refetch: refetchLegacy } = useEstimateFeesPerGas({
    chainId,
    type: "legacy",
    scopeKey: `${chainId}-legacy`,
  });

  const { data: blockNumber } = useScopedBlockNumber();

  console.log(estimatedFeesPerGasEIP1559);

  useEffect(() => {
    refetchLegacy();
    refetchEIP1559();
  }, [blockNumber, refetchLegacy, refetchEIP1559]);

  return {
    gasPrice: estimatedFeesPerGasLegacy?.gasPrice,
    baseFee: estimatedFeesPerGasEIP1559?.maxFeePerGas,
    priorityFee: estimatedFeesPerGasEIP1559?.maxPriorityFeePerGas,
  };
}
