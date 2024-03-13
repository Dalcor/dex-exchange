import JSBI from "jsbi";
import { useEffect, useMemo, useState } from "react";

import { useLiquidityTierStore } from "@/app/[locale]/add/[[...currency]]/hooks/useLiquidityTierStore";
import { useAddLiquidityTokensStore } from "@/app/[locale]/add/[[...currency]]/stores/useAddLiquidityTokensStore";
import { useLiquidityPriceRangeStore } from "@/app/[locale]/add/[[...currency]]/stores/useLiquidityPriceRangeStore";
import { usePool } from "@/hooks/usePools";
import { FeeAmount, TICK_SPACINGS } from "@/sdk";
import { Price } from "@/sdk/entities/fractions/price";
import { Token } from "@/sdk/entities/token";
import { encodeSqrtRatioX96 } from "@/sdk/utils/encodeSqrtRatioX96";
import { nearestUsableTick } from "@/sdk/utils/nearestUsableTick";
import { priceToClosestTick, tickToPrice } from "@/sdk/utils/priceTickConversions";
import { TickMath } from "@/sdk/utils/tickMath";

import LiquidityChartRangeInput from "./LiquidityChartRangeInput";
import { Bound } from "./LiquidityChartRangeInput/types";

export function tryParsePrice(baseToken?: Token, quoteToken?: Token, value?: string) {
  if (!baseToken || !quoteToken || !value) {
    return undefined;
  }

  if (!value.match(/^\d*\.?\d+$/)) {
    return undefined;
  }

  const [whole, fraction] = value.split(".");

  const decimals = fraction?.length ?? 0;
  const withoutDecimals = JSBI.BigInt((whole ?? "") + (fraction ?? ""));

  return new Price(
    baseToken,
    quoteToken,
    JSBI.multiply(JSBI.BigInt(10 ** decimals), JSBI.BigInt(10 ** baseToken.decimals)),
    JSBI.multiply(withoutDecimals, JSBI.BigInt(10 ** quoteToken.decimals)),
  );
}

export function tryParseTick(
  baseToken?: Token,
  quoteToken?: Token,
  feeAmount?: FeeAmount,
  value?: string,
): number | undefined {
  if (!baseToken || !quoteToken || !feeAmount || !value) {
    return undefined;
  }

  const price = tryParsePrice(baseToken, quoteToken, value);

  if (!price) {
    return undefined;
  }

  let tick: number;

  // check price is within min/max bounds, if outside return min/max
  const sqrtRatioX96 = encodeSqrtRatioX96(price.numerator, price.denominator);

  if (JSBI.greaterThanOrEqual(sqrtRatioX96, TickMath.MAX_SQRT_RATIO)) {
    tick = TickMath.MAX_TICK;
  } else if (JSBI.lessThanOrEqual(sqrtRatioX96, TickMath.MIN_SQRT_RATIO)) {
    tick = TickMath.MIN_TICK;
  } else {
    // this function is agnostic to the base, will always return the correct tick
    tick = priceToClosestTick(price);
  }

  return nearestUsableTick(tick, TICK_SPACINGS[feeAmount]);
}

export function getTickToPrice(
  baseToken?: Token,
  quoteToken?: Token,
  tick?: number,
): Price<Token, Token> | undefined {
  if (!baseToken || !quoteToken || typeof tick !== "number") {
    return undefined;
  }
  return tickToPrice(baseToken, quoteToken, tick);
}

export const PriceRange = () => {
  const { tokenA, tokenB, setTokenA, setTokenB, setBothTokens } = useAddLiquidityTokensStore();
  const { tier, setTier } = useLiquidityTierStore();

  const [poolState, pool] = usePool(tokenA, tokenB, tier);

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
  const price: Price<Token, Token> | undefined = useMemo(() => {
    // TODO — if no liquidity use typed value
    // if no liquidity use typed value
    // if (noLiquidity) {
    //   const parsedQuoteAmount = tryParseCurrencyAmount(startPriceTypedValue, invertPrice ? token0 : token1)
    //   if (parsedQuoteAmount && token0 && token1) {
    //     const baseAmount = tryParseCurrencyAmount('1', invertPrice ? token1 : token0)
    //     const price =
    //       baseAmount && parsedQuoteAmount
    //         ? new Price(
    //             baseAmount.currency,
    //             parsedQuoteAmount.currency,
    //             baseAmount.quotient,
    //             parsedQuoteAmount.quotient
    //           )
    //         : undefined
    //     return (invertPrice ? price?.invert() : price) ?? undefined
    //   }
    //   return undefined
    // } else {
    // get the amount of quote currency
    return pool && token0 ? pool.priceOf(token0) : undefined;
    // }
  }, [
    // noLiquidity,
    // startPriceTypedValue,
    // invertPrice,
    // token1,
    token0,
    pool,
  ]);
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

  const {
    leftRangeTypedValue,
    rightRangeTypedValue,
    ticks,
    setLeftRangeTypedValue,
    setRightRangeTypedValue,
    setTicks,
  } = useLiquidityPriceRangeStore();
  const existingPosition = undefined as any;

  // parse typed range values and determine the closest ticks
  // lower should always be a smaller tick
  useEffect(() => {
    setTicks({
      [Bound.LOWER]:
        typeof existingPosition?.tickLower === "number"
          ? existingPosition.tickLower
          : (invertPrice && typeof rightRangeTypedValue === "boolean") ||
              (!invertPrice && typeof leftRangeTypedValue === "boolean")
            ? tickSpaceLimits[Bound.LOWER]
            : invertPrice
              ? tryParseTick(token1, token0, tier, rightRangeTypedValue.toString())
              : tryParseTick(token0, token1, tier, leftRangeTypedValue.toString()),
      [Bound.UPPER]:
        typeof existingPosition?.tickUpper === "number"
          ? existingPosition.tickUpper
          : (!invertPrice && typeof rightRangeTypedValue === "boolean") ||
              (invertPrice && typeof leftRangeTypedValue === "boolean")
            ? tickSpaceLimits[Bound.UPPER]
            : invertPrice
              ? tryParseTick(token1, token0, tier, leftRangeTypedValue.toString())
              : tryParseTick(token0, token1, tier, rightRangeTypedValue.toString()),
    });
  }, [
    existingPosition,
    tier,
    invertPrice,
    leftRangeTypedValue,
    rightRangeTypedValue,
    token0,
    token1,
    tickSpaceLimits,
    setTicks,
  ]);

  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks || {};

  // specifies whether the lower and upper ticks is at the exteme bounds
  const ticksAtLimit = useMemo(
    () => ({
      [Bound.LOWER]: tier && tickLower === tickSpaceLimits.LOWER,
      [Bound.UPPER]: tier && tickUpper === tickSpaceLimits.UPPER,
    }),
    [tickSpaceLimits, tickLower, tickUpper, tier],
  );

  const pricesAtLimit = useMemo(() => {
    return {
      [Bound.LOWER]: getTickToPrice(token0, token1, tickSpaceLimits.LOWER),
      [Bound.UPPER]: getTickToPrice(token0, token1, tickSpaceLimits.UPPER),
    };
  }, [token0, token1, tickSpaceLimits.LOWER, tickSpaceLimits.UPPER]);

  // always returns the price with 0 as base token
  const pricesAtTicks = useMemo(() => {
    return {
      [Bound.LOWER]: getTickToPrice(token0, token1, ticks[Bound.LOWER]),
      [Bound.UPPER]: getTickToPrice(token0, token1, ticks[Bound.UPPER]),
    };
  }, [token0, token1, ticks]);

  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks;

  return (
    <div className="bg-secondary-bg rounded-3 px-5 pt-5 pb-4">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <span className="text-12 text-secondary-text">Current price</span>
          <input
            className="font-medium text-16 bg-transparent border-0 outline-0"
            type="text"
            value={formattedPrice}
          />
          <span className="text-12 text-secondary-text">
            {tokenA ? `${tokenB?.name} per ${tokenA?.name}` : null}
          </span>
        </div>
      </div>
      <LiquidityChartRangeInput
        currencyA={tokenA ?? undefined}
        currencyB={tokenB ?? undefined}
        feeAmount={tier}
        ticksAtLimit={ticksAtLimit}
        price={
          price ? parseFloat((invertPrice ? price.invert() : price).toSignificant(8)) : undefined
        }
        priceLower={priceLower}
        priceUpper={priceUpper}
        // interactive={!hasExistingPosition}
        onLeftRangeInput={setLeftRangeTypedValue}
        onRightRangeInput={setRightRangeTypedValue}
        interactive={true}
      />
    </div>
  );
};
