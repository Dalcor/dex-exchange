"use client";

import clsx from "clsx";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { parseUnits } from "viem";

import FeeAmountSettings from "@/app/[locale]/add/[[...currency]]/components/FeeAmountSettings";
import PriceRangeInput from "@/app/[locale]/add/[[...currency]]/components/PriceRangeInput";
import { PoolState } from "@/app/[locale]/add/[[...currency]]/hooks/types";
import useAddLiquidity from "@/app/[locale]/add/[[...currency]]/hooks/useAddLiquidity";
import { useLiquidityTierStore } from "@/app/[locale]/add/[[...currency]]/hooks/useLiquidityTierStore";
import { useAddLiquidityTokensStore } from "@/app/[locale]/add/[[...currency]]/stores/useAddLiquidityTokensStore";
import { useLiquidityPriceRangeStore } from "@/app/[locale]/add/[[...currency]]/stores/useLiquidityPriceRangeStore";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import SelectButton from "@/components/atoms/SelectButton";
import Switch from "@/components/atoms/Switch";
import SystemIconButton from "@/components/buttons/SystemIconButton";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import { FEE_TIERS } from "@/config/constants/liquidityFee";
import { nonFungiblePositionManagerAddress } from "@/config/contracts";
import { WrappedToken } from "@/config/types/WrappedToken";
import useAllowance from "@/hooks/useAllowance";
import usePools, { usePool } from "@/hooks/usePools";
import { useTokens } from "@/hooks/useTokenLists";
import { useRouter } from "@/navigation";
import { FeeAmount, Rounding, TICK_SPACINGS } from "@/sdk";
import { Currency } from "@/sdk/entities/currency";
import { Pool } from "@/sdk/entities/pool";
import { nearestUsableTick } from "@/sdk/utils/nearestUsableTick";
import { tickToPrice } from "@/sdk/utils/priceTickConversions";
import { TickMath } from "@/sdk/utils/tickMath";

import DepositAmount from "./components/DepositAmount";
import { getTickToPrice, PriceRange } from "./components/PriceRange";
import { Bound } from "./components/PriceRange/LiquidityChartRangeInput/types";

export function useRangeHopCallbacks(
  baseCurrency: Currency | undefined,
  quoteCurrency: Currency | undefined,
  feeAmount: FeeAmount | undefined,
  tickLower: number | undefined,
  tickUpper: number | undefined,
  pool?: Pool | undefined | null,
) {
  // const dispatch = useAppDispatch();

  const baseToken = useMemo(() => baseCurrency?.wrapped, [baseCurrency]);
  const quoteToken = useMemo(() => quoteCurrency?.wrapped, [quoteCurrency]);

  const getDecrementLower = useCallback(() => {
    if (baseToken && quoteToken && typeof tickLower === "number" && feeAmount) {
      const newPrice = tickToPrice(baseToken, quoteToken, tickLower - TICK_SPACINGS[feeAmount]);
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (!(typeof tickLower === "number") && baseToken && quoteToken && feeAmount && pool) {
      const newPrice = tickToPrice(
        baseToken,
        quoteToken,
        pool.tickCurrent - TICK_SPACINGS[feeAmount],
      );
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    return "";
  }, [baseToken, quoteToken, tickLower, feeAmount, pool]);

  const getIncrementLower = useCallback(() => {
    if (baseToken && quoteToken && typeof tickLower === "number" && feeAmount) {
      const newPrice = tickToPrice(baseToken, quoteToken, tickLower + TICK_SPACINGS[feeAmount]);
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (!(typeof tickLower === "number") && baseToken && quoteToken && feeAmount && pool) {
      const newPrice = tickToPrice(
        baseToken,
        quoteToken,
        pool.tickCurrent + TICK_SPACINGS[feeAmount],
      );
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    return "";
  }, [baseToken, quoteToken, tickLower, feeAmount, pool]);

  const getDecrementUpper = useCallback(() => {
    if (baseToken && quoteToken && typeof tickUpper === "number" && feeAmount) {
      const newPrice = tickToPrice(baseToken, quoteToken, tickUpper - TICK_SPACINGS[feeAmount]);
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (!(typeof tickUpper === "number") && baseToken && quoteToken && feeAmount && pool) {
      const newPrice = tickToPrice(
        baseToken,
        quoteToken,
        pool.tickCurrent - TICK_SPACINGS[feeAmount],
      );
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    return "";
  }, [baseToken, quoteToken, tickUpper, feeAmount, pool]);

  const getIncrementUpper = useCallback(() => {
    if (baseToken && quoteToken && typeof tickUpper === "number" && feeAmount) {
      const newPrice = tickToPrice(baseToken, quoteToken, tickUpper + TICK_SPACINGS[feeAmount]);
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (!(typeof tickUpper === "number") && baseToken && quoteToken && feeAmount && pool) {
      const newPrice = tickToPrice(
        baseToken,
        quoteToken,
        pool.tickCurrent + TICK_SPACINGS[feeAmount],
      );
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
    }
    return "";
  }, [baseToken, quoteToken, tickUpper, feeAmount, pool]);

  return {
    getDecrementLower,
    getIncrementLower,
    getDecrementUpper,
    getIncrementUpper,
  };
}

export default function AddPoolPage({
  params,
}: {
  params: {
    currency: [string, string, string];
  };
}) {
  const [isOpenedTokenPick, setIsOpenedTokenPick] = useState(false);
  const router = useRouter();

  const currency = params.currency;

  const { tokenA, tokenB, setTokenA, setTokenB, setBothTokens } = useAddLiquidityTokensStore();

  const isSorted = tokenA && tokenB && tokenA.sortsBefore(tokenB);

  const tokens = useTokens();

  // const { isLoading, isError, largestUsageFeeTier, distributions } = useFeeTierDistribution(tokenA, tokenB);
  //
  // const { currencyIdA, currencyIdB, feeAmount } = useCurrencyParams();
  //

  const { handleAddLiquidity } = useAddLiquidity();

  const poolKeys: any = useMemo(() => {
    return [
      [tokenA, tokenB, FeeAmount.LOWEST],
      [tokenA, tokenB, FeeAmount.LOW],
      [tokenA, tokenB, FeeAmount.MEDIUM],
      [tokenA, tokenB, FeeAmount.HIGH],
    ];
  }, [tokenA, tokenB]);

  // get pool data on-chain for latest states
  // const pools = usePools(poolKeys);

  const pools = usePools(poolKeys);

  const [, pool] = usePool(tokenA, tokenB, FeeAmount.LOWEST);

  //
  // useEffect(() => {
  //   console.log("Effect pools");
  //   if (pool && pool[1]) {
  //     console.log(pool[1]);
  //     const a = SqrtPriceMath.getNextSqrtPriceFromInput(
  //       pool[1].sqrtRatioX96,
  //       pool[1].liquidity,
  //       JSBI.BigInt(1),
  //       true,
  //     );
  //
  //     console.log("Output estimation:" + a);
  //   }
  // }, [pool]);

  const poolsByFeeTier: Record<FeeAmount, PoolState> = useMemo(
    () =>
      pools.reduce(
        (acc, [curPoolState, curPool]) => {
          acc = {
            ...acc,
            ...{ [curPool?.fee as FeeAmount]: curPoolState },
          };
          return acc;
        },
        {
          // default all states to NOT_EXISTS
          [FeeAmount.LOWEST]: PoolState.NOT_EXISTS,
          [FeeAmount.LOW]: PoolState.NOT_EXISTS,
          [FeeAmount.MEDIUM]: PoolState.NOT_EXISTS,
          [FeeAmount.HIGH]: PoolState.NOT_EXISTS,
        },
      ),
    [pools],
  );

  const { setIsOpen } = useTransactionSettingsDialogStore();

  const { tier, setTier } = useLiquidityTierStore();

  const lang = useLocale();

  const [currentlyPicking, setCurrentlyPicking] = useState<"tokenA" | "tokenB">("tokenA");

  const handlePick = useCallback(
    (token: WrappedToken) => {
      if (currentlyPicking === "tokenA") {
        setTokenA(token);
      }

      if (currentlyPicking === "tokenB") {
        setTokenB(token);
      }

      setIsOpenedTokenPick(false);
    },
    [currentlyPicking, setTokenA, setTokenB],
  );

  useEffect(() => {
    if (currency?.[0]) {
      const token = tokens.find((t) => t.address === currency[0]);
      if (token) {
        setTokenA(token);
      }
    }

    if (currency?.[1]) {
      const token = tokens.find((t) => t.address === currency[1]);
      if (token) {
        setTokenB(token);
      }
    }

    if (currency?.[2]) {
      if (FEE_TIERS.includes(Number(currency[2]))) {
        setTier(Number(currency[2]));
      }
    }
  }, [currency, setTier, setTokenA, setTokenB, tokens]);

  const {
    isAllowed: isAllowedA,
    writeTokenApprove: approveA,
    isApproving: isApprovingA,
  } = useAllowance({
    token: tokenA,
    contractAddress: nonFungiblePositionManagerAddress,
    amountToCheck: parseUnits("2", tokenA?.decimals || 18),
  });

  const {
    isAllowed: isAllowedB,
    writeTokenApprove: approveB,
    isApproving: isApprovingB,
  } = useAllowance({
    token: tokenB,
    contractAddress: nonFungiblePositionManagerAddress,
    amountToCheck: parseUnits("2", tokenB?.decimals || 18),
  });

  const {
    ticks,
    leftRangeTypedValue,
    rightRangeTypedValue,
    clearPriceRange,
    setFullRange,
    setLeftRangeTypedValue,
    setRightRangeTypedValue,
  } = useLiquidityPriceRangeStore();

  // const [fullRange, setFullRange] = useState(false);

  // TODO
  const fullRange = false;
  const handleSetFullRange = useCallback(() => {
    setFullRange();

    // const minPrice = pricesAtLimit[Bound.LOWER];
    // if (minPrice) searchParams.set("minPrice", minPrice.toSignificant(5));
    // const maxPrice = pricesAtLimit[Bound.UPPER];
    // if (maxPrice) searchParams.set("maxPrice", maxPrice.toSignificant(5));
    // setSearchParams(searchParams);
  }, [
    setFullRange,
    // pricesAtLimit,
    // searchParams,
    // setSearchParams,
  ]);

  const { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper } =
    useRangeHopCallbacks(
      tokenA ?? undefined,
      tokenB ?? undefined,
      tier,
      ticks.LOWER,
      ticks.UPPER,
      pool,
    );

  const [token0, token1] = useMemo(
    () =>
      tokenA && tokenB
        ? tokenA.sortsBefore(tokenB)
          ? [tokenA, tokenB]
          : [tokenB, tokenA]
        : [undefined, undefined],
    [tokenA, tokenB],
  );

  // always returns the price with 0 as base token
  const pricesAtTicks = useMemo(() => {
    return {
      [Bound.LOWER]: getTickToPrice(token0, token1, ticks[Bound.LOWER]),
      [Bound.UPPER]: getTickToPrice(token0, token1, ticks[Bound.UPPER]),
    };
  }, [token0, token1, ticks]);

  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks;

  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks || {};

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

  const leftPrice = isSorted ? priceLower : priceUpper?.invert();
  const rightPrice = isSorted ? priceUpper : priceLower?.invert();

  return (
    <Container>
      <div className="w-[1200px] bg-primary-bg mx-auto my-[80px]">
        <div className="flex justify-between items-center rounded-t-2 border py-2.5 px-6 border-secondary-border">
          <SystemIconButton
            iconSize={32}
            iconName="back"
            size="large"
            onClick={() => router.push("/pools")}
          />
          <h2 className="text-20 font-bold">Add Liquidity</h2>
          <SystemIconButton
            iconSize={32}
            size="large"
            iconName="settings"
            onClick={() => setIsOpen(true)}
          />
        </div>
        <div className="rounded-b-2 border border-secondary-border border-t-0 p-10 bg-primary-bg">
          <h3 className="text-16 font-bold mb-4">Select pair</h3>
          <div className="flex gap-3 mb-5">
            <SelectButton
              variant="rounded-secondary"
              fullWidth
              onClick={() => {
                setCurrentlyPicking("tokenA");
                setIsOpenedTokenPick(true);
              }}
              size="large"
            >
              {tokenA ? (
                <span className="flex gap-2 items-center">
                  <Image
                    className="flex-shrink-0"
                    src={tokenA.logoURI}
                    alt="Ethereum"
                    width={32}
                    height={32}
                  />
                  <span className="block overflow-ellipsis whitespace-nowrap w-[141px] overflow-hidden text-left">
                    {tokenA.symbol}
                  </span>
                </span>
              ) : (
                <span>Select token</span>
              )}
            </SelectButton>
            <SelectButton
              variant="rounded-secondary"
              fullWidth
              onClick={() => {
                setCurrentlyPicking("tokenB");
                setIsOpenedTokenPick(true);
              }}
              size="large"
            >
              {tokenB ? (
                <span className="flex gap-2 items-center">
                  <Image
                    className="flex-shrink-0"
                    src={tokenB.logoURI}
                    alt="Ethereum"
                    width={32}
                    height={32}
                  />
                  <span className="block overflow-ellipsis whitespace-nowrap w-[141px] overflow-hidden text-left">
                    {tokenB.symbol}
                  </span>
                </span>
              ) : (
                <span>Select token</span>
              )}
            </SelectButton>
          </div>
          <FeeAmountSettings />
          <div className="mb-5" />
          <div className="grid gap-5 grid-cols-2">
            <div className="flex flex-col gap-5">
              <DepositAmount />
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-16 font-bold">Set price range</h3>
                    <div className="flex gap-3 items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-primary-text text-12">Full range</span>
                        <Switch checked={fullRange} setChecked={() => setFullRange()} />
                      </div>

                      <div className="flex p-0.5 gap-0.5 rounded-2 bg-secondary-bg">
                        <button
                          onClick={() => {
                            if (!isSorted) {
                              setBothTokens({
                                tokenA: tokenB,
                                tokenB: tokenA,
                              });
                              clearPriceRange();
                            }
                          }}
                          className={clsx(
                            "text-12 h-7 rounded-2 min-w-[60px] px-3 border duration-200",
                            isSorted
                              ? "bg-active-bg border-green text-primary-text"
                              : "hover:bg-active-bg bg-primary-bg border-transparent text-secondary-text",
                          )}
                        >
                          {isSorted ? tokenA?.symbol : tokenB?.symbol}
                        </button>
                        <button
                          onClick={() => {
                            if (isSorted) {
                              setBothTokens({
                                tokenA: tokenB,
                                tokenB: tokenA,
                              });
                              clearPriceRange();
                            }
                          }}
                          className={clsx(
                            "text-12 h-7 rounded-2 min-w-[60px] px-3 border duration-200",
                            !isSorted
                              ? "bg-active-bg border-green text-primary-text"
                              : "hover:bg-active-bg bg-primary-bg border-transparent text-secondary-text",
                          )}
                        >
                          {isSorted ? tokenB?.symbol : tokenA?.symbol}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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
              </div>

              <PriceRange />
            </div>
          </div>

          <div className="grid gap-2 mb-5 grid-cols-2">
            {!isAllowedA && (
              <Button variant="outline" fullWidth onClick={() => approveA()}>
                {isApprovingA ? "Loading..." : <span>Approve {tokenA?.symbol}</span>}
              </Button>
            )}
            {!isAllowedB && (
              <Button variant="outline" fullWidth onClick={() => approveB()}>
                {isApprovingB ? "Loading..." : <span>Approve {tokenB?.symbol}</span>}
              </Button>
            )}
          </div>

          {/* <Button onClick={handleAddLiquidity} fullWidth>
            Add liquidity
          </Button> */}
        </div>
        <PickTokenDialog
          handlePick={handlePick}
          isOpen={isOpenedTokenPick}
          setIsOpen={setIsOpenedTokenPick}
        />
      </div>
    </Container>
  );
}
