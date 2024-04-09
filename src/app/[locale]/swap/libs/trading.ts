import JSBI from "jsbi";
import { useCallback, useMemo } from "react";
import { Address, parseUnits } from "viem";
import {
  useAccount,
  useChainId,
  useSimulateContract,
  useWalletClient,
  useWriteContract,
} from "wagmi";

import { useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import { QUOTER_ABI } from "@/config/abis/quoter";
import { QOUTERV0_ABI } from "@/config/abis/quoter_v0";
import { usePool } from "@/hooks/usePools";
import { FeeAmount, TradeType } from "@/sdk";
import { QUOTER_ADDRESS } from "@/sdk/addresses";
import { DexChainId } from "@/sdk/chains";
import { Currency } from "@/sdk/entities/currency";
import { CurrencyAmount } from "@/sdk/entities/fractions/currencyAmount";
import { Route } from "@/sdk/entities/route";
import { Trade } from "@/sdk/entities/trade";

export type TokenTrade = Trade<Currency, Currency, TradeType>;

export function useTrade(): { trade: TokenTrade | null; handleManualEstimate: () => void } {
  const { tokenA, tokenB, setTokenA, setTokenB } = useSwapTokensStore();
  // const { typedValue, independentField, dependentField, setTypedValue } = useSwapAmountsStore();
  const { chainId } = useAccount();
  const { typedValue } = useSwapAmountsStore();
  const [, pool] = usePool(tokenA, tokenB, FeeAmount.MEDIUM);

  const swapRoute = useMemo(() => {
    if (pool && tokenA && tokenB) {
      return new Route([pool], tokenA, tokenB);
    }

    return null;
  }, [pool, tokenA, tokenB]);

  console.log(pool);

  const amountOutData = useSimulateContract({
    address: QUOTER_ADDRESS[chainId as DexChainId],
    abi: QUOTER_ABI,
    functionName: "quoteExactInputSingle",
    args: [
      {
        tokenIn: tokenA?.address as Address,
        tokenOut: tokenB?.address as Address,
        fee: FeeAmount.MEDIUM, //3000
        amountIn: parseUnits(typedValue, tokenA?.decimals || 18),
        sqrtPriceLimitX96: BigInt(0),
      },
    ],
    query: { enabled: Boolean(tokenA) && Boolean(tokenB) },
  });
  const { data: walletClient } = useWalletClient();

  const handleManualEstimate = useCallback(async () => {
    console.log("Trying to run function...");
    console.log({
      address: QUOTER_ADDRESS[chainId as DexChainId],
      abi: QUOTER_ABI,
      functionName: "quoteExactInputSingle",
      args: [
        {
          tokenIn: tokenA?.address as Address,
          tokenOut: tokenB?.address as Address,
          fee: FeeAmount.MEDIUM, //3000
          amountIn: parseUnits(typedValue, tokenA?.decimals || 18),
          sqrtPriceLimitX96: BigInt(0),
        },
      ],
    });
    try {
      if (!walletClient) {
        return console.log("No client");
      }
      walletClient.writeContract({
        address: QUOTER_ADDRESS[chainId as DexChainId],
        abi: QUOTER_ABI,
        functionName: "quoteExactInputSingle",
        args: [
          {
            tokenIn: tokenA?.address as Address,
            tokenOut: tokenB?.address as Address,
            fee: FeeAmount.MEDIUM, //3000
            amountIn: parseUnits(typedValue, tokenA?.decimals || 18),
            sqrtPriceLimitX96: BigInt(0),
          },
        ],
      });
    } catch (e) {
      console.log(e);
    }
  }, [chainId, tokenA, tokenB, typedValue, walletClient]);

  console.log("DARA");
  console.log(amountOutData);

  const amountOut = useMemo(() => {
    if (amountOutData.data) {
      const [_amountOut, sqrtPriceX96AfterList, initializedTicksCrossedList, gasEstimate] =
        amountOutData.data.result;

      return _amountOut;
    }

    return;
  }, [amountOutData.data]);

  const trade = useMemo(() => {
    console.log("TRADDEE");
    console.log(amountOut);
    console.log(swapRoute);
    if (!swapRoute || !tokenA || !tokenB || !amountOut) {
      return null;
    }

    return Trade.createUncheckedTrade({
      route: swapRoute,
      inputAmount: CurrencyAmount.fromRawAmount(
        tokenA,
        parseUnits(typedValue, tokenA?.decimals).toString(),
      ),
      outputAmount: CurrencyAmount.fromRawAmount(tokenB, JSBI.BigInt(amountOut.toString())),
      tradeType: TradeType.EXACT_INPUT,
    });
  }, [amountOut, swapRoute, tokenA, tokenB, typedValue]);
  return {
    trade,
    handleManualEstimate,
  };
}
