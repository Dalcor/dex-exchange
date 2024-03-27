import JSBI from "jsbi";
import { useMemo } from "react";

import TokenDepositCard from "@/app/[locale]/add/[[...currency]]/components/DepositAmounts/TokenDepositCard";
import useAddLiquidity from "@/app/[locale]/add/[[...currency]]/hooks/useAddLiquidity";
import {
  Field,
  useLiquidityAmountsStore,
} from "@/app/[locale]/add/[[...currency]]/stores/useAddLiquidityAmountsStore";
import { useAddLiquidityTokensStore } from "@/app/[locale]/add/[[...currency]]/stores/useAddLiquidityTokensStore";
import { useLiquidityPriceRangeStore } from "@/app/[locale]/add/[[...currency]]/stores/useLiquidityPriceRangeStore";
import { useLiquidityTierStore } from "@/app/[locale]/add/[[...currency]]/stores/useLiquidityTierStore";
import Button from "@/components/atoms/Button";
import Tooltip from "@/components/atoms/Tooltip";
import { tryParseCurrencyAmount } from "@/functions/tryParseTick";
import { usePool } from "@/hooks/usePools";
import { Currency } from "@/sdk/entities/currency";
import { CurrencyAmount } from "@/sdk/entities/fractions/currencyAmount";
import { Position } from "@/sdk/entities/position";

// TODO
const BIG_INT_ZERO = JSBI.BigInt(0);

export const DepositAmounts = ({
  currentAllowanceA,
  currentAllowanceB,
  currentDepositA,
  currentDepositB,
}: {
  currentAllowanceA?: bigint;
  currentAllowanceB?: bigint;
  currentDepositA?: bigint;
  currentDepositB?: bigint;
}) => {
  const { ticks } = useLiquidityPriceRangeStore();
  const { LOWER: tickLower, UPPER: tickUpper } = ticks;

  // TODO
  const outOfRange = false;
  // mark invalid range
  const invalidRange = Boolean(
    typeof tickLower === "number" && typeof tickUpper === "number" && tickLower >= tickUpper,
  );
  const { typedValue, independentField, dependentField, setTypedValue } =
    useLiquidityAmountsStore();

  const { tokenA, tokenB } = useAddLiquidityTokensStore();
  const { tier, setTier } = useLiquidityTierStore();
  const [poolState, pool] = usePool(tokenA, tokenB, tier);

  const currencyA = tokenA;
  const currencyB = tokenB;

  const currencies = {
    [Field.CURRENCY_A]: tokenA,
    [Field.CURRENCY_B]: tokenB,
  };
  const poolForPosition = pool;

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

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? "",
  };

  // TODO
  const deposit0Disabled = false;
  const deposit1Disabled = false;

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

  const { handleAddLiquidity } = useAddLiquidity();

  return (
    <div className="flex flex-col gap-5">
      {currencies[Field.CURRENCY_A] && (
        <TokenDepositCard
          value={formattedAmounts[Field.CURRENCY_A]}
          onChange={(value) => setTypedValue({ field: Field.CURRENCY_A, typedValue: value })}
          token={currencies[Field.CURRENCY_A]}
          currentAllowance={currentAllowanceA}
          currentDeposit={currentDepositA}
        />
      )}
      <div className="px-5 py-2 flex justify-between bg-tertiary-bg rounded-3">
        <div className="flex flex-col">
          <div className="text-secondary-text flex items-center gap-1 text-14">
            Gas price
            <Tooltip iconSize={20} text="Tooltip text" />
          </div>
          <div>33.53 GWEI</div>
        </div>
        <div className="flex flex-col">
          <div className="text-secondary-text text-14">Total fee</div>
          <div>0.005 ETH</div>
        </div>
        <div className="flex flex-col">
          <div className="text-secondary-text text-14">Transactions</div>
          <div>2</div>
        </div>
        <div>
          <Button size="x-small" variant="outline">
            Details
          </Button>
        </div>
      </div>
      {currencies[Field.CURRENCY_B] && (
        <TokenDepositCard
          value={formattedAmounts[Field.CURRENCY_B]}
          onChange={(value) => setTypedValue({ field: Field.CURRENCY_B, typedValue: value })}
          token={currencies[Field.CURRENCY_B]}
          currentAllowance={currentAllowanceB}
          currentDeposit={currentDepositB}
        />
      )}
      <Button onClick={() => handleAddLiquidity(position, true)} fullWidth>
        Add liquidity
      </Button>
      <Button onClick={() => handleAddLiquidity(position, false)} fullWidth>
        Mint liquidity
      </Button>
    </div>
  );
};
