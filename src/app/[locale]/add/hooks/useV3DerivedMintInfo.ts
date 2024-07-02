import JSBI from "jsbi";
import { useMemo } from "react";
import { useAccount } from "wagmi";

import { tryParseCurrencyAmount } from "@/functions/tryParseTick";
import { PoolState, usePool } from "@/hooks/usePools";
import { FeeAmount } from "@/sdk_hybrid/constants";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { CurrencyAmount } from "@/sdk_hybrid/entities/fractions/currencyAmount";
import { Price } from "@/sdk_hybrid/entities/fractions/price";
import { Pool } from "@/sdk_hybrid/entities/pool";
import { Position } from "@/sdk_hybrid/entities/position";
import { Token } from "@/sdk_hybrid/entities/token";
import { encodeSqrtRatioX96 } from "@/sdk_hybrid/utils/encodeSqrtRatioX96";
import { priceToClosestTick } from "@/sdk_hybrid/utils/priceTickConversions";
import { TickMath } from "@/sdk_hybrid/utils/tickMath";

import { Field, useLiquidityAmountsStore } from "../stores/useAddLiquidityAmountsStore";
import { useLiquidityPriceRangeStore } from "../stores/useLiquidityPriceRangeStore";

const BIG_INT_ZERO = JSBI.BigInt(0);

export const useV3DerivedMintInfo = ({
  tokenA,
  tokenB,
  tier,
  price,
}: {
  tokenA?: Token;
  tokenB?: Token;
  tier: FeeAmount;
  price: Price<Token, Token> | undefined;
}) => {
  const { ticks } = useLiquidityPriceRangeStore();
  const { LOWER: tickLower, UPPER: tickUpper } = ticks;

  // mark invalid range
  const invalidRange = Boolean(
    typeof tickLower === "number" && typeof tickUpper === "number" && tickLower >= tickUpper,
  );
  const { typedValue, independentField, dependentField, setTypedValue } =
    useLiquidityAmountsStore();

  const [poolState, pool] = usePool({ currencyA: tokenA, currencyB: tokenB, tier });
  const noLiquidity = poolState === PoolState.NOT_EXISTS;

  const currencyA = tokenA;
  const currencyB = tokenB;

  const currencies = {
    [Field.CURRENCY_A]: tokenA,
    [Field.CURRENCY_B]: tokenB,
  };

  // check if price is within range
  const outOfRange: boolean =
    pool && typeof tickLower === "number" && typeof tickUpper === "number"
      ? pool.tickCurrent < tickLower || pool.tickCurrent >= tickUpper
      : false;

  // check for invalid price input (converts to invalid ratio)
  const invalidPrice = useMemo(() => {
    const sqrtRatioX96 = price ? encodeSqrtRatioX96(price.numerator, price.denominator) : undefined;
    return (
      price &&
      sqrtRatioX96 &&
      !(
        JSBI.greaterThanOrEqual(sqrtRatioX96, TickMath.MIN_SQRT_RATIO) &&
        JSBI.lessThan(sqrtRatioX96, TickMath.MAX_SQRT_RATIO)
      )
    );
  }, [price]);

  // used for ratio calculation when pool not initialized
  const mockPool = useMemo(() => {
    if (tokenA && tokenB && tier && price && !invalidPrice) {
      const currentTick = priceToClosestTick(price);
      const currentSqrt = TickMath.getSqrtRatioAtTick(currentTick);
      return new Pool(tokenA, tokenB, tier, currentSqrt, JSBI.BigInt(0), currentTick, []);
    } else {
      return undefined;
    }
  }, [tier, invalidPrice, price, tokenA, tokenB]);

  // if pool exists use it, if not use the mock pool
  const poolForPosition: Pool | undefined = pool ?? mockPool;

  // amounts
  const independentAmount: CurrencyAmount<Currency> | undefined = tryParseCurrencyAmount(
    typedValue,
    currencies[independentField],
  );

  const dependentAmount: CurrencyAmount<Currency> | undefined = useMemo(() => {
    // we wrap the currencies just to get the price in terms of the other token
    const wrappedIndependentAmount = independentAmount?.wrapped;
    const dependentCurrency = dependentField === Field.CURRENCY_B ? currencyB : currencyA;

    if (
      independentAmount &&
      wrappedIndependentAmount &&
      typeof tickLower === "number" &&
      typeof tickUpper === "number" &&
      poolForPosition
    ) {
      // if price is out of range or invalid range - return 0 (single deposit will be independent)
      if (outOfRange || invalidRange) {
        return undefined;
      }
      const position: Position | undefined = wrappedIndependentAmount.currency.equals(
        poolForPosition.token0,
      )
        ? Position.fromAmount0({
            pool: poolForPosition,
            tickLower,
            tickUpper,
            amount0: independentAmount.quotient,
            useFullPrecision: true, // we want full precision for the theoretical position
          })
        : Position.fromAmount1({
            pool: poolForPosition,
            tickLower,
            tickUpper,
            amount1: independentAmount.quotient,
          });

      const dependentTokenAmount = wrappedIndependentAmount.currency.equals(poolForPosition.token0)
        ? position.amount1
        : position.amount0;
      return (
        dependentCurrency &&
        CurrencyAmount.fromRawAmount(dependentCurrency, dependentTokenAmount.quotient)
      );
    }

    return undefined;
  }, [
    independentAmount,
    outOfRange,
    dependentField,
    currencyB,
    currencyA,
    tickLower,
    tickUpper,
    poolForPosition,
    invalidRange,
  ]);

  const parsedAmounts: { [field in Field]: CurrencyAmount<Currency> | undefined } = useMemo(() => {
    return {
      [Field.CURRENCY_A]:
        independentField === Field.CURRENCY_A ? independentAmount : dependentAmount,
      [Field.CURRENCY_B]:
        independentField === Field.CURRENCY_A ? dependentAmount : independentAmount,
    };
  }, [dependentAmount, independentAmount, independentField]);

  // single deposit only if price is out of range
  const deposit0Disabled = Boolean(
    typeof tickUpper === "number" && poolForPosition && poolForPosition.tickCurrent >= tickUpper,
  );
  const deposit1Disabled = Boolean(
    typeof tickLower === "number" && poolForPosition && poolForPosition.tickCurrent <= tickLower,
  );

  // sorted for token order
  const depositADisabled =
    invalidRange ||
    Boolean(
      (deposit0Disabled && poolForPosition && tokenA && poolForPosition.token0.equals(tokenA)) ||
        (deposit1Disabled && poolForPosition && tokenA && poolForPosition.token1.equals(tokenA)),
    );
  const depositBDisabled =
    invalidRange ||
    Boolean(
      (deposit0Disabled && poolForPosition && tokenB && poolForPosition.token0.equals(tokenB)) ||
        (deposit1Disabled && poolForPosition && tokenB && poolForPosition.token1.equals(tokenB)),
    );

  // create position entity based on users selection
  const position: Position | undefined = useMemo(() => {
    if (
      !poolForPosition ||
      !tokenA ||
      !tokenB ||
      typeof tickLower !== "number" ||
      typeof tickUpper !== "number" ||
      invalidRange
    ) {
      return undefined;
    }

    // mark as 0 if disabled because out of range
    const amount0 = !deposit0Disabled
      ? parsedAmounts?.[tokenA.equals(poolForPosition.token0) ? Field.CURRENCY_A : Field.CURRENCY_B]
          ?.quotient
      : BIG_INT_ZERO;
    const amount1 = !deposit1Disabled
      ? parsedAmounts?.[tokenA.equals(poolForPosition.token0) ? Field.CURRENCY_B : Field.CURRENCY_A]
          ?.quotient
      : BIG_INT_ZERO;

    if (amount0 !== undefined && amount1 !== undefined) {
      return Position.fromAmounts({
        pool: poolForPosition,
        tickLower,
        tickUpper,
        amount0,
        amount1,
        useFullPrecision: true, // we want full precision for the theoretical position
      });
    } else {
      return undefined;
    }
  }, [
    parsedAmounts,
    poolForPosition,
    tokenA,
    tokenB,
    deposit0Disabled,
    deposit1Disabled,
    invalidRange,
    tickLower,
    tickUpper,
  ]);

  return {
    parsedAmounts,
    position,
    currencies,
    noLiquidity,
    outOfRange,
    depositADisabled,
    depositBDisabled,
  };
};
