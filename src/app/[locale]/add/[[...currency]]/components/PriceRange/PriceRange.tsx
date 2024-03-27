import { useCallback, useEffect, useMemo } from "react";

import { getTickToPrice, tryParseTick } from "@/functions/tryParseTick";
import { usePool } from "@/hooks/usePools";
import { TICK_SPACINGS } from "@/sdk";
import { Price } from "@/sdk/entities/fractions/price";
import { Token } from "@/sdk/entities/token";
import { nearestUsableTick } from "@/sdk/utils/nearestUsableTick";
import { TickMath } from "@/sdk/utils/tickMath";

import { useRangeHopCallbacks } from "../../hooks/useRangeHopCallbacks";
import { useAddLiquidityTokensStore } from "../../stores/useAddLiquidityTokensStore";
import { useLiquidityPriceRangeStore } from "../../stores/useLiquidityPriceRangeStore";
import { useLiquidityTierStore } from "../../stores/useLiquidityTierStore";
import { CurrentPrice } from "./CurrentPrice";
import LiquidityChartRangeInput from "./LiquidityChartRangeInput";
import { Bound } from "./LiquidityChartRangeInput/types";
import { PriceRangeHeader } from "./PriceRangeHeader";
import PriceRangeInput from "./PriceRangeInput";

export const PriceRange = () => {
  const { tokenA, tokenB, setBothTokens } = useAddLiquidityTokensStore();
  const [token0, token1] = useMemo(
    () =>
      tokenA && tokenB
        ? tokenA.sortsBefore(tokenB)
          ? [tokenA, tokenB]
          : [tokenB, tokenA]
        : [undefined, undefined],
    [tokenA, tokenB],
  );

  const {
    ticks,
    leftRangeTypedValue,
    rightRangeTypedValue,
    clearPriceRange,
    setFullRange,
    setLeftRangeTypedValue,
    setRightRangeTypedValue,
    resetPriceRangeValue,
    setTicks,
  } = useLiquidityPriceRangeStore();
  const { tier } = useLiquidityTierStore();
  const [, pool] = usePool(tokenA, tokenB, tier);

  // always returns the price with 0 as base token
  const pricesAtTicks = useMemo(() => {
    return {
      [Bound.LOWER]: getTickToPrice(token0, token1, ticks[Bound.LOWER]),
      [Bound.UPPER]: getTickToPrice(token0, token1, ticks[Bound.UPPER]),
    };
  }, [token0, token1, ticks]);

  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks || {};
  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks;

  const invertPrice = Boolean(tokenA && token0 && !tokenA.equals(token0));
  const isSorted = tokenA && tokenB && tokenA.sortsBefore(tokenB);
  const isFullRange =
    typeof leftRangeTypedValue === "boolean" && typeof rightRangeTypedValue === "boolean";
  const leftPrice = isSorted ? priceLower : priceUpper?.invert();
  const rightPrice = isSorted ? priceUpper : priceLower?.invert();

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

  const handleSetFullRange = useCallback(() => {
    const currentPrice = price
      ? parseFloat((invertPrice ? price.invert() : price).toSignificant(8))
      : undefined;

    if (!isFullRange) {
      setFullRange();
    } else {
      resetPriceRangeValue({
        price: currentPrice,
        feeAmount: tier,
      });
    }
  }, [setFullRange, isFullRange, resetPriceRangeValue, price, invertPrice, tier]);

  // lower and upper limits in the tick space for `feeAmoun<Trans>
  const tickSpaceLimits = useMemo(
    () => ({
      [Bound.LOWER]: tier ? nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[tier]) : undefined,
      [Bound.UPPER]: tier ? nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[tier]) : undefined,
    }),
    [tier],
  );

  // specifies whether the lower and upper ticks is at the exteme bounds
  const ticksAtLimit = useMemo(
    () => ({
      [Bound.LOWER]: tier && tickLower === tickSpaceLimits.LOWER,
      [Bound.UPPER]: tier && tickUpper === tickSpaceLimits.UPPER,
    }),
    [tickSpaceLimits, tickLower, tickUpper, tier],
  );

  const { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper } =
    useRangeHopCallbacks(
      tokenA ?? undefined,
      tokenB ?? undefined,
      tier,
      ticks.LOWER,
      ticks.UPPER,
      pool,
    );

  // TODO existingPosition
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

  return (
    <div className="flex flex-col gap-5">
      <PriceRangeHeader
        isSorted={!!isSorted}
        isFullRange={isFullRange}
        button0Text={isSorted ? tokenA?.symbol : tokenB?.symbol}
        button0Handler={() => {
          if (!isSorted) {
            setBothTokens({
              tokenA: tokenB,
              tokenB: tokenA,
            });
            clearPriceRange();
          }
        }}
        button1Text={isSorted ? tokenB?.symbol : tokenA?.symbol}
        button1Handler={() => {
          if (isSorted) {
            setBothTokens({
              tokenA: tokenB,
              tokenB: tokenA,
            });
            clearPriceRange();
          }
        }}
        handleSetFullRange={handleSetFullRange}
      />
      <PriceRangeInput
        value={
          ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]
            ? "0"
            : leftPrice?.toSignificant(8) ?? ""
        }
        onUserInput={setLeftRangeTypedValue}
        title="Low price"
        decrement={isSorted ? getDecrementLower : getIncrementUpper}
        increment={isSorted ? getIncrementLower : getDecrementUpper}
      />
      <PriceRangeInput
        title="High price"
        value={
          ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]
            ? "∞"
            : rightPrice?.toSignificant(8) ?? ""
        }
        onUserInput={setRightRangeTypedValue}
        decrement={isSorted ? getDecrementUpper : getIncrementLower}
        increment={isSorted ? getIncrementUpper : getDecrementLower}
      />

      <CurrentPrice
        price={formattedPrice}
        description={tokenA ? `${tokenB?.name} per ${tokenA?.name}` : ""}
      />
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
