import JSBI from "jsbi";
import { useMemo } from "react";
import { Address, parseUnits } from "viem";
import { useSimulateContract } from "wagmi";

import { useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import { QUOTER_ABI } from "@/config/abis/quoter";
import { usePool } from "@/hooks/usePools";
import { FeeAmount, TradeType } from "@/sdk";
import { Currency } from "@/sdk/entities/currency";
import { CurrencyAmount } from "@/sdk/entities/fractions/currencyAmount";
import { Route } from "@/sdk/entities/route";
import { Trade } from "@/sdk/entities/trade";

export type TokenTrade = Trade<Currency, Currency, TradeType>;

// Trading Functions

export function useTrade(): TokenTrade | null {
  const { tokenA, tokenB, setTokenA, setTokenB } = useSwapTokensStore();
  // const { typedValue, independentField, dependentField, setTypedValue } = useSwapAmountsStore();

  const { typedValue } = useSwapAmountsStore();
  const [, pool] = usePool(tokenA, tokenB, FeeAmount.LOW);

  const swapRoute = useMemo(() => {
    if (pool && tokenA && tokenB) {
      return new Route([pool], tokenA, tokenB);
    }

    return null;
  }, [pool, tokenA, tokenB]);

  const amountOutData = useSimulateContract({
    address: "0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3",
    abi: QUOTER_ABI,
    functionName: "quoteExactInputSingle",
    args: [
      {
        tokenIn: tokenA?.address as Address,
        tokenOut: tokenB?.address as Address,
        fee: FeeAmount.LOW,
        amountIn: parseUnits(typedValue, 18),
        sqrtPriceLimitX96: BigInt(0),
      },
    ],
    query: { enabled: Boolean(tokenA) && Boolean(tokenB) },
  });

  const amountOut = useMemo(() => {
    if (amountOutData.data) {
      const [_amountOut, sqrtPriceX96AfterList, initializedTicksCrossedList, gasEstimate] =
        amountOutData.data.result;

      return _amountOut;
    }

    return;
  }, [amountOutData.data]);

  return useMemo(() => {
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
}
