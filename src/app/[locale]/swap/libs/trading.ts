import JSBI from "jsbi";
import { useMemo } from "react";
import { Address, parseUnits } from "viem";
import { useAccount, useSimulateContract } from "wagmi";

import { useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import { QUOTER_ABI } from "@/config/abis/quoter";
import { usePool } from "@/hooks/usePools";
import { QUOTER_ADDRESS } from "@/sdk_hybrid/addresses";
import { DexChainId } from "@/sdk_hybrid/chains";
import { FeeAmount, TradeType } from "@/sdk_hybrid/constants";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { CurrencyAmount } from "@/sdk_hybrid/entities/fractions/currencyAmount";
import { Route } from "@/sdk_hybrid/entities/route";
import { Trade } from "@/sdk_hybrid/entities/trade";

export type TokenTrade = Trade<Currency, Currency, TradeType>;

export function useTrade(): { trade: TokenTrade | null } {
  const { tokenA, tokenB, tokenAAddress, tokenBAddress, setTokenA, setTokenB } =
    useSwapTokensStore();
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

  console.log("POOL");
  console.log(pool);

  const amountOutData = useSimulateContract({
    address: QUOTER_ADDRESS[chainId as DexChainId],
    abi: QUOTER_ABI,
    functionName: "quoteExactInputSingle",
    args: [
      tokenAAddress as Address,
      tokenBAddress as Address,
      FeeAmount.MEDIUM, //3000
      parseUnits(typedValue, tokenA?.decimals || 18),
      BigInt(0),
    ],
    query: {
      enabled:
        Boolean(tokenA) && Boolean(tokenB) && Boolean(tokenAAddress) && Boolean(tokenBAddress),
    },
  });

  console.log("DD");
  console.log(amountOutData);

  // const amountOutData = useSimulateContract({
  //   address: QUOTER_ADDRESS_V0[chainId as DexChainId],
  //   abi: QUOTER_ABI_V0,
  //   functionName: "quoteExactInputSingle",
  //   args: [
  //     tokenA?.address0 as Address,
  //     tokenB?.address0 as Address,
  //     FeeAmount.MEDIUM, //3000
  //     parseUnits(typedValue, tokenA?.decimals || 18),
  //     BigInt(0),
  //   ],
  //   query: { enabled: Boolean(tokenA) && Boolean(tokenB) },
  // });

  const amountOut = useMemo(() => {
    if (amountOutData.data) {
      return amountOutData.data.result;
    }

    return;
  }, [amountOutData.data]);

  const trade = useMemo(() => {
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
  };
}
