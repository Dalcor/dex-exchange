import { useMemo } from "react";

import { WrappedToken } from "@/config/types/WrappedToken";
import { getTickToPrice, tryParseCurrencyAmount } from "@/functions/tryParseTick";
import { PoolState, usePool } from "@/hooks/usePools";
import { TICK_SPACINGS } from "@/sdk";
import { Price } from "@/sdk/entities/fractions/price";
import { Pool } from "@/sdk/entities/pool";
import { Token } from "@/sdk/entities/token";
import { nearestUsableTick } from "@/sdk/utils/nearestUsableTick";
import { TickMath } from "@/sdk/utils/tickMath";

import { Bound } from "../components/PriceRange/LiquidityChartRangeInput/types";
import { useAddLiquidityTokensStore } from "../stores/useAddLiquidityTokensStore";
import { useLiquidityPriceRangeStore } from "../stores/useLiquidityPriceRangeStore";
import { useLiquidityTierStore } from "../stores/useLiquidityTierStore";

// export const usePrice = ({
//   pool,
//   startPriceTypedValue,
//   token0,
//   token1,
//   invertPrice,
//   noLiquidity,
// }: {
//   pool: Pool;
//   startPriceTypedValue: string;
//   noLiquidity: boolean;
//   invertPrice: boolean;
//   token0?: WrappedToken;
//   token1?: WrappedToken;
// }) => {
//   // always returns the price with 0 as base token
//   const price: Price<Token, Token> | undefined = useMemo(() => {
//     // if no liquidity use typed value
//     if (noLiquidity) {
//       const parsedQuoteAmount = tryParseCurrencyAmount(
//         startPriceTypedValue,
//         invertPrice ? token0 : token1,
//       );
//       if (parsedQuoteAmount && token0 && token1) {
//         const baseAmount = tryParseCurrencyAmount("1", invertPrice ? token1 : token0);
//         const price =
//           baseAmount && parsedQuoteAmount
//             ? new Price(
//                 baseAmount.currency,
//                 parsedQuoteAmount.currency,
//                 baseAmount.quotient,
//                 parsedQuoteAmount.quotient,
//               )
//             : undefined;
//         return (invertPrice ? price?.invert() : price) ?? undefined;
//       }
//       return undefined;
//     } else {
//       // get the amount of quote currency
//       return pool && token0 ? pool.priceOf(token0) : undefined;
//     }
//   }, [noLiquidity, startPriceTypedValue, invertPrice, token1, token0, pool]);

//   return price;
// };

export const usePriceRange = () =>
  // {
  //   // pool,
  //   // startPriceTypedValue,
  //   // token0,
  //   // token1,
  //   // invertPrice,
  // }: {
  //   // pool: Pool;
  //   // startPriceTypedValue: string;
  //   // invertPrice: boolean;
  //   // token0?: WrappedToken;
  //   // token1?: WrappedToken;
  // },
  {
    const {
      ticks,
      leftRangeTypedValue,
      rightRangeTypedValue,
      startPriceTypedValue,
      clearPriceRange,
      setFullRange,
      setLeftRangeTypedValue,
      setRightRangeTypedValue,
      setStartPriceTypedValue,
      resetPriceRangeValue,
      setTicks,
    } = useLiquidityPriceRangeStore();
    const { tokenA, tokenB, setBothTokens } = useAddLiquidityTokensStore();
    const { tier } = useLiquidityTierStore();

    const [poolState, pool] = usePool(tokenA, tokenB, tier);
    const noLiquidity = poolState === PoolState.NOT_EXISTS;

    const [token0, token1] = useMemo(
      () =>
        tokenA && tokenB
          ? tokenA.sortsBefore(tokenB)
            ? [tokenA, tokenB]
            : [tokenB, tokenA]
          : [undefined, undefined],
      [tokenA, tokenB],
    );

    const invertPrice = Boolean(tokenA && token0 && !tokenA.equals(token0));

    // always returns the price with 0 as base token
    const pricesAtTicks = useMemo(() => {
      return {
        [Bound.LOWER]: getTickToPrice(token0, token1, ticks[Bound.LOWER]),
        [Bound.UPPER]: getTickToPrice(token0, token1, ticks[Bound.UPPER]),
      };
    }, [token0, token1, ticks]);

    // always returns the price with 0 as base token
    const price: Price<Token, Token> | undefined = useMemo(() => {
      // if no liquidity use typed value
      if (noLiquidity) {
        const parsedQuoteAmount = tryParseCurrencyAmount(
          startPriceTypedValue,
          invertPrice ? token0 : token1,
        );
        if (parsedQuoteAmount && token0 && token1) {
          const baseAmount = tryParseCurrencyAmount("1", invertPrice ? token1 : token0);
          const price =
            baseAmount && parsedQuoteAmount
              ? new Price(
                  baseAmount.currency,
                  parsedQuoteAmount.currency,
                  baseAmount.quotient,
                  parsedQuoteAmount.quotient,
                )
              : undefined;
          return (invertPrice ? price?.invert() : price) ?? undefined;
        }
        return undefined;
      } else {
        // get the amount of quote currency
        return pool && token0 ? pool.priceOf(token0) : undefined;
      }
    }, [noLiquidity, startPriceTypedValue, invertPrice, token1, token0, pool]);

    const formattedPrice = price
      ? parseFloat((invertPrice ? price?.invert() : price).toSignificant())
      : "-";

    // lower and upper limits in the tick space for `feeAmoun<Trans>
    const tickSpaceLimits = useMemo(
      () => ({
        [Bound.LOWER]: tier ? nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[tier]) : undefined,
        [Bound.UPPER]: tier ? nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[tier]) : undefined,
      }),
      [tier],
    );

    const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks || {};
    const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks;

    // specifies whether the lower and upper ticks is at the exteme bounds
    const ticksAtLimit = useMemo(
      () => ({
        [Bound.LOWER]: tier && tickLower === tickSpaceLimits.LOWER,
        [Bound.UPPER]: tier && tickUpper === tickSpaceLimits.UPPER,
      }),
      [tickSpaceLimits, tickLower, tickUpper, tier],
    );

    const isSorted = tokenA && tokenB && tokenA.sortsBefore(tokenB);
    const isFullRange =
      typeof leftRangeTypedValue === "boolean" && typeof rightRangeTypedValue === "boolean";
    const leftPrice = isSorted ? priceLower : priceUpper?.invert();
    const rightPrice = isSorted ? priceUpper : priceLower?.invert();

    return {
      price,
      formattedPrice,
      invertPrice,
      pricesAtTicks,
      ticksAtLimit,
      isSorted,
      isFullRange,
      leftPrice,
      rightPrice,
      token0,
      token1,
      tickSpaceLimits,
    };
  };
