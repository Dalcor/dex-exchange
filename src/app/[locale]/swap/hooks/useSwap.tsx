import { useCallback, useMemo, useState } from "react";
import { Address, getAbiItem, parseUnits } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import useSwapGas from "@/app/[locale]/swap/hooks/useSwapGas";
import { useTrade } from "@/app/[locale]/swap/libs/trading";
import { useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import { ROUTER_ABI } from "@/config/abis/router";
import { formatFloat } from "@/functions/formatFloat";
import { FeeAmount } from "@/sdk";
import { ROUTER_ADDRESS } from "@/sdk/addresses";
import { DEX_SUPPORTED_CHAINS, DexChainId } from "@/sdk/chains";
import {
  GasFeeModel,
  RecentTransactionTitleTemplate,
  stringifyObject,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";
import { useTransactionSettingsStore } from "@/stores/useTransactionSettingsStore";

export default function useSwap() {
  const { data: walletClient } = useWalletClient();
  const { tokenA, tokenB, setTokenA, setTokenB } = useSwapTokensStore();
  const { trade, handleManualEstimate } = useTrade();
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient();

  const [estimatedGas, setEstimatedGas] = useState<bigint>(BigInt(0));

  const { gasPrice } = useSwapGas();

  const { slippage, deadline: _deadline } = useTransactionSettingsStore();
  const { typedValue } = useSwapAmountsStore();
  const { addRecentTransaction } = useRecentTransactionsStore();

  const gasPriceFormatted = useMemo(() => {
    switch (gasPrice.model) {
      case GasFeeModel.EIP1559:
        return {
          maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
          maxFeePerGas: gasPrice.maxFeePerGas,
        };
      case GasFeeModel.LEGACY:
        return { gasPrice: gasPrice.gasPrice };
    }
  }, [gasPrice]);

  const output = useMemo(() => {
    if (!trade) {
      return "";
    }

    return (+trade.outputAmount.toSignificant() * (100 - slippage)) / 100;
  }, [slippage, trade]);

  const swapParams = useMemo(() => {
    if (!tokenA || !tokenB || !chainId || !DEX_SUPPORTED_CHAINS.includes(chainId)) {
      return null;
    }

    return {
      address: ROUTER_ADDRESS[chainId as DexChainId],
      abi: ROUTER_ABI,
      functionName: "exactInputSingle" as "exactInputSingle",
      args: [
        {
          tokenIn: tokenA.address as Address,
          tokenOut: tokenB.address as Address,
          fee: FeeAmount.MEDIUM,
          recipient: address as Address,
          amountIn: parseUnits(typedValue, 18),
          amountOutMinimum: BigInt(0),
          sqrtPriceLimitX96: BigInt(0),
        },
      ] as any,
      ...gasPriceFormatted,
    };
  }, [address, chainId, gasPriceFormatted, tokenA, tokenB, typedValue]);

  // useEffect(() => {
  //   if (!publicClient || !swapParams) {
  //     return;
  //   }
  //
  //   IIFE(async () => {
  //     const _estimatedGas = await publicClient.estimateContractGas({
  //       ...swapParams,
  //       account: address,
  //     });
  //     setEstimatedGas(_estimatedGas);
  //   });
  // }, [publicClient, swapParams, address]);

  const handleSwap = useCallback(async () => {
    if (!trade) {
      handleManualEstimate();
    }

    if (
      !walletClient ||
      !address ||
      !tokenA ||
      !tokenB ||
      !trade ||
      !output ||
      !publicClient ||
      !chainId ||
      !swapParams
      // !estimatedGas
    ) {
      console.log(trade);
      console.log("NONONO");
      return;
    }

    // const { request } = await publicClient.simulateContract({
    //   ...swapParams,
    //   account: address,
    //   gas: estimatedGas + BigInt(30000),
    // });
    const hash = await walletClient.writeContract(swapParams);

    const nonce = await publicClient.getTransactionCount({
      address,
      blockTag: "pending",
    });

    if (hash) {
      addRecentTransaction(
        {
          hash,
          nonce,
          chainId,
          gas: {
            ...stringifyObject(gasPrice),
            gas: (estimatedGas + BigInt(30000)).toString(),
          },
          params: {
            ...stringifyObject(swapParams),
            abi: [getAbiItem({ name: "exactInputSingle", abi: ROUTER_ABI })],
          },
          title: {
            symbol0: tokenA.symbol!,
            symbol1: tokenB.symbol!,
            template: RecentTransactionTitleTemplate.SWAP,
            amount0: formatFloat(typedValue),
            amount1: formatFloat(output.toString()),
            logoURI0: tokenA?.logoURI || "/tokens/placeholder.svg",
            logoURI1: tokenB?.logoURI || "/tokens/placeholder.svg",
          },
        },
        address,
      );
    }
  }, [
    addRecentTransaction,
    address,
    chainId,
    estimatedGas,
    gasPrice,
    output,
    publicClient,
    swapParams,
    tokenA,
    tokenB,
    trade,
    typedValue,
    walletClient,
  ]);

  return { handleSwap, estimatedGas };
}
