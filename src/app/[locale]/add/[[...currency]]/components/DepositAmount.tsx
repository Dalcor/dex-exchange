import JSBI from "jsbi";
import Image from "next/image";
import { useMemo } from "react";
import { parseUnits } from "viem";

import TokenDepositCard from "@/app/[locale]/add/[[...currency]]/components/TokenDepositCard";
import useAddLiquidity from "@/app/[locale]/add/[[...currency]]/hooks/useAddLiquidity";
import { useLiquidityTierStore } from "@/app/[locale]/add/[[...currency]]/hooks/useLiquidityTierStore";
import {
  Field,
  useLiquidityAmountsStore,
} from "@/app/[locale]/add/[[...currency]]/stores/useAddLiquidityAmountsStore";
import { useAddLiquidityTokensStore } from "@/app/[locale]/add/[[...currency]]/stores/useAddLiquidityTokensStore";
import { useLiquidityPriceRangeStore } from "@/app/[locale]/add/[[...currency]]/stores/useLiquidityPriceRangeStore";
import Button from "@/components/atoms/Button";
import Tooltip from "@/components/atoms/Tooltip";
import { WrappedToken } from "@/config/types/WrappedToken";
import { usePool } from "@/hooks/usePools";
import { Currency } from "@/sdk/entities/currency";
import { CurrencyAmount } from "@/sdk/entities/fractions/currencyAmount";
import { Position } from "@/sdk/entities/position";

// TODO
const BIG_INT_ZERO = JSBI.BigInt(0);

function truncateValue(value: string, decimals: number): string {
  const parts = value.split(/[.,]/);
  const symbol = value.includes(".") ? "." : ",";
  if (parts.length > 1 && parts[1].length > decimals) {
    return parts[0] + symbol + parts[1].slice(0, decimals);
  }
  return value;
}

/**
 * Parses a CurrencyAmount from the passed string.
 * Returns the CurrencyAmount, or undefined if parsing fails.
 */
export function tryParseCurrencyAmount<T extends Currency>(
  value?: string,
  currency?: T,
): CurrencyAmount<T> | undefined {
  if (!value || !currency) {
    return undefined;
  }
  try {
    const typedValueParsed = parseUnits(
      truncateValue(value, currency.decimals),
      currency.decimals,
    ).toString();
    if (typedValueParsed !== "0") {
      return CurrencyAmount.fromRawAmount(currency, JSBI.BigInt(typedValueParsed));
    }
  } catch (error) {
    // fails if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error);
  }
  return undefined;
}

function DepositCard({
  value,
  onChange,
  token,
}: {
  value: any;
  onChange: (value: string) => void;
  token?: WrappedToken;
}) {
  return (
    <div className="bg-secondary-bg border border-secondary-border rounded-1 p-5">
      <div className="flex items-center justify-between mb-1">
        <input
          className="font-medium text-16 bg-transparent border-0 outline-0 min-w-0"
          type="text"
          value={value}
          onChange={(data) => onChange(data.target.value)}
        />
        <div className="pr-3 py-1 pl-1 bg-primary-bg rounded-5 flex items-center gap-2 flex-shrink-0">
          <Image src="/tokens/ETH.svg" alt="Ethereum" width={24} height={24} />
          {token?.name || "-"}
        </div>
      </div>
      <div className="flex justify-between items-center text-12">
        <span>—</span>
        <span>Balance: 23.245 ETH</span>
      </div>
    </div>
  );
}

export default function DepositAmount() {
  const { ticks } = useLiquidityPriceRangeStore();
  const { LOWER: tickLower, UPPER: tickUpper } = ticks;

  const outOfRange = false;
  const invalidRange = false;
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
    <>
      {currencies[Field.CURRENCY_A] && (
        <TokenDepositCard
          value={formattedAmounts[Field.CURRENCY_A]}
          onChange={(value) => setTypedValue({ field: Field.CURRENCY_A, typedValue: value })}
          token={currencies[Field.CURRENCY_A]}
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
        />
      )}
      <Button onClick={() => handleAddLiquidity(position, true)} fullWidth>
        Add liquidity
      </Button>
    </>
  );
}
