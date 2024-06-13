import clsx from "clsx";
import { useTranslations } from "next-intl";
import { useCallback, useEffect } from "react";

import Svg from "@/components/atoms/Svg";
import { tryParseTick } from "@/functions/tryParseTick";
import { usePool } from "@/hooks/usePools";
import { Price } from "@/sdk_hybrid/entities/fractions/price";
import { Token } from "@/sdk_hybrid/entities/token";

import { useRangeHopCallbacks } from "../../hooks/useRangeHopCallbacks";
import { useTokensStandards } from "../../stores/useAddLiquidityAmountsStore";
import { useAddLiquidityTokensStore } from "../../stores/useAddLiquidityTokensStore";
import { useLiquidityPriceRangeStore } from "../../stores/useLiquidityPriceRangeStore";
import { useLiquidityTierStore } from "../../stores/useLiquidityTierStore";
import { CurrentPrice } from "./CurrentPrice";
import LiquidityChartRangeInput from "./LiquidityChartRangeInput";
import { Bound } from "./LiquidityChartRangeInput/types";
import { PriceRangeHeader } from "./PriceRangeHeader";
import PriceRangeInput from "./PriceRangeInput";

export const PriceRange = ({
  noLiquidity,
  formattedPrice,
  invertPrice,
  isFullRange,
  isSorted,
  leftPrice,
  price,
  pricesAtTicks,
  rightPrice,
  tickSpaceLimits,
  ticksAtLimit,
  token0,
  token1,
  outOfRange,
  isFormDisabled,
}: {
  noLiquidity: boolean;
  price: Price<Token, Token> | undefined;
  formattedPrice: string | number;
  invertPrice: boolean;
  pricesAtTicks: {
    LOWER: Price<Token, Token> | undefined;
    UPPER: Price<Token, Token> | undefined;
  };
  ticksAtLimit: {
    LOWER: boolean;
    UPPER: boolean;
  };
  isSorted: boolean | undefined;
  isFullRange: boolean;
  leftPrice: Price<Token, Token> | undefined;
  rightPrice: Price<Token, Token> | undefined;
  token0: Token | undefined;
  token1: Token | undefined;
  tickSpaceLimits: {
    LOWER: number | undefined;
    UPPER: number | undefined;
  };
  outOfRange: boolean;
  isFormDisabled: boolean;
}) => {
  const t = useTranslations("Liquidity");
  const { tokenA, tokenB, setBothTokens } = useAddLiquidityTokensStore();
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
  const { tier } = useLiquidityTierStore();
  const [poolState, pool] = usePool(tokenA, tokenB, tier);

  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks;

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
    <div
      className={clsx(
        "flex flex-col gap-5 bg-secondary-bg px-5 py-6 rounded-3",
        isFormDisabled && "opacity-20",
      )}
    >
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
        title={t("low_price")}
        decrement={isSorted ? getDecrementLower : getIncrementUpper}
        increment={isSorted ? getIncrementLower : getDecrementUpper}
        tokenA={tokenA}
        tokenB={tokenB}
        noLiquidity={noLiquidity}
      />
      <PriceRangeInput
        title={t("high_price")}
        value={
          ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]
            ? "∞"
            : rightPrice?.toSignificant(8) ?? ""
        }
        onUserInput={setRightRangeTypedValue}
        decrement={isSorted ? getDecrementUpper : getIncrementLower}
        increment={isSorted ? getIncrementUpper : getDecrementLower}
        tokenA={tokenA}
        tokenB={tokenB}
        noLiquidity={noLiquidity}
      />
      {outOfRange ? (
        <span className="text-14 border border-orange rounded-3 px-4 py-2 bg-orange-bg">
          Your position will not earn fees or be used in trades until the market price moves into
          your range.
        </span>
      ) : null}

      {noLiquidity ? (
        <>
          <div className="flex px-5 py-3 bg-blue-bg border-blue border rounded-3 gap-2">
            <Svg iconName="info" className="min-w-[24px] text-blue" />
            <span className="text-16">
              This pool must be initialized before you can add liquidity. To initialize, select a
              starting price for the pool. Then, enter your liquidity price range and deposit
              amount. Gas fees will be higher than usual due to the initialization transaction.
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold text-16">Starting price</span>
            <input
              className="outline-0 text-16 w-full rounded-3 bg-primary-bg px-5 py-3"
              placeholder="0"
              type="text"
              value={startPriceTypedValue}
              onChange={(e) => setStartPriceTypedValue(e.target.value)}
            />
            <div className="flex justify-between text-14 text-secondary-text mt-2">
              <span>{`Starting ${tokenA?.symbol} price:`}</span>
              <span>{`${formattedPrice} ${tokenA ? `${tokenB?.symbol} per ${tokenA?.symbol}` : ""}`}</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <CurrentPrice
            price={formattedPrice}
            description={tokenA ? `${tokenB?.symbol} per ${tokenA?.symbol}` : ""}
          />
          <LiquidityChartRangeInput
            currencyA={tokenA ?? undefined}
            currencyB={tokenB ?? undefined}
            feeAmount={tier}
            ticksAtLimit={ticksAtLimit}
            price={
              price
                ? parseFloat((invertPrice ? price.invert() : price).toSignificant(8))
                : undefined
            }
            priceLower={priceLower}
            priceUpper={priceUpper}
            // interactive={!hasExistingPosition}
            onLeftRangeInput={setLeftRangeTypedValue}
            onRightRangeInput={setRightRangeTypedValue}
            interactive={true}
          />
        </>
      )}
    </div>
  );
};
