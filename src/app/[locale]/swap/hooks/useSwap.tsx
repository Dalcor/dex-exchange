import { useCallback, useMemo, useState } from "react";
import { Address, getAbiItem, parseUnits } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import { useTrade } from "@/app/[locale]/swap/libs/trading";
import { useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import { ROUTER_ABI } from "@/config/abis/router";
import { FeeAmount } from "@/sdk";
import {
  GasFeeModel,
  RecentTransactionTitleTemplate,
  stringifyObject,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";
import { useTransactionSettingsStore } from "@/stores/useTransactionSettingsStore";

const swapAddress = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E";
export default function useSwap() {
  const { data: walletClient } = useWalletClient();
  const { tokenA, tokenB, setTokenA, setTokenB } = useSwapTokensStore();
  const trade = useTrade();
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient();

  const { slippage, deadline: _deadline } = useTransactionSettingsStore();
  const { typedValue } = useSwapAmountsStore();
  const { addRecentTransaction } = useRecentTransactionsStore();

  const output = useMemo(() => {
    if (!trade) {
      return "";
    }

    return (+trade.outputAmount.toSignificant() * (100 - slippage)) / 100;
  }, [slippage, trade]);

  const handleSwap = useCallback(async () => {
    if (
      !walletClient ||
      !address ||
      !tokenA ||
      !tokenB ||
      !trade ||
      !output ||
      !publicClient ||
      !chainId
    ) {
      return;
    }

    const params = {
      address: swapAddress as Address,
      abi: ROUTER_ABI,
      functionName: "exactInputSingle" as "exactInputSingle",
      args: [
        {
          tokenIn: tokenA.address as Address,
          tokenOut: tokenB.address as Address,
          fee: FeeAmount.LOW,
          recipient: address as Address,
          amountIn: parseUnits(typedValue, 18),
          amountOutMinimum: BigInt(0),
          sqrtPriceLimitX96: BigInt(0),
        },
      ] as any,
    };

    const estimatedGas = await publicClient.estimateContractGas({ ...params, account: address });

    const { request } = await publicClient.simulateContract({
      ...params,
      account: address,
      gas: estimatedGas + BigInt(30000),
    });
    const hash = await walletClient.writeContract(request);

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
            model: GasFeeModel.EIP1559,
            gas: (estimatedGas + BigInt(30000)).toString(),
            maxFeePerGas: undefined,
            maxPriorityFeePerGas: undefined,
          },
          params: {
            ...stringifyObject(params),
            abi: [getAbiItem({ name: "exactInputSingle", abi: ROUTER_ABI })],
          },
          title: {
            symbol0: tokenA.symbol!,
            symbol1: tokenB.symbol!,
            template: RecentTransactionTitleTemplate.SWAP,
            amount0: typedValue,
            amount1: output.toString(),
            logoURI0: tokenA?.logoURI || "/tokens/placeholder.svg",
            logoURI1: tokenB?.logoURI || "/tokens/placeholder.svg",
          },
        },
        address,
      );
    }

    console.log(hash);
  }, [
    addRecentTransaction,
    address,
    chainId,
    output,
    publicClient,
    tokenA,
    tokenB,
    trade,
    typedValue,
    walletClient,
  ]);

  return { handleSwap };
}
