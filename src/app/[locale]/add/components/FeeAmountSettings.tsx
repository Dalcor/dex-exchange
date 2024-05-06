import clsx from "clsx";
import { useLocale } from "next-intl";
import { ButtonHTMLAttributes, useEffect, useMemo, useState } from "react";

import { useAddLiquidityTokensStore } from "@/app/[locale]/add/stores/useAddLiquidityTokensStore";
import { useLiquidityTierStore } from "@/app/[locale]/add/stores/useLiquidityTierStore";
import Collapse from "@/components/atoms/Collapse";
import Svg from "@/components/atoms/Svg";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import { FEE_AMOUNT_DETAIL, FEE_TIERS } from "@/config/constants/liquidityFee";
import { useFeeTierDistribution } from "@/hooks/useFeeTierDistribution";
import usePools, { PoolState, usePool } from "@/hooks/usePools";
import { FeeAmount } from "@/sdk_hybrid/constants";

import { useTokensStandards } from "../stores/useAddLiquidityAmountsStore";
import { useLiquidityPriceRangeStore } from "../stores/useLiquidityPriceRangeStore";

interface FeeAmountOptionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  feeAmount: FeeAmount;
  distributions: ReturnType<typeof useFeeTierDistribution>["distributions"];
  poolState: PoolState;
}
function FeeAmountOption({
  feeAmount,
  active = false,
  distributions,
  poolState,
  ...props
}: FeeAmountOptionProps) {
  return (
    <button
      {...props}
      className={clsx(
        "flex justify-between items-center px-5 py-2 rounded-1 border cursor-pointer  duration-200",
        active
          ? "bg-green-bg shadow-select border-green pointer-events-none"
          : "border-transparent bg-primary-bg hover:bg-green-bg",
      )}
    >
      <div className="flex items-center gap-2">
        <span>{FEE_AMOUNT_DETAIL[feeAmount].label}% fee tier</span>
        <Badge
          variant={BadgeVariant.PERCENTAGE}
          percentage={
            !distributions || poolState === PoolState.NOT_EXISTS || poolState === PoolState.INVALID
              ? "Not created"
              : distributions[feeAmount] !== undefined
                ? `${distributions[feeAmount]?.toFixed(0)}% select`
                : "No data"
          }
        />
        <span></span>
        {/*<TextLabel text="1% select" color="grey"/>*/}
      </div>
      <span className="text-secondary-text">{FEE_AMOUNT_DETAIL[feeAmount].description}</span>
    </button>
  );
}

export default function FeeAmountSettings() {
  const locale = useLocale();

  const [isFeeOpened, setIsFeeOpened] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const { tier, setTier } = useLiquidityTierStore();
  const { tokenA, tokenB } = useAddLiquidityTokensStore();
  const { clearPriceRange } = useLiquidityPriceRangeStore();

  const { tokenAStandard, tokenBStandard } = useTokensStandards();
  const { isLoading, isError, largestUsageFeeTier, distributions } = useFeeTierDistribution({
    tokenA,
    tokenB,
    tokenAStandard,
    tokenBStandard,
  });
  const [poolState, pool] = usePool(tokenA, tokenB, tier, tokenAStandard, tokenBStandard);

  // get pool data on-chain for latest states
  const pools = usePools([
    [tokenA, tokenB, FeeAmount.LOWEST, tokenAStandard, tokenBStandard],
    [tokenA, tokenB, FeeAmount.LOW, tokenAStandard, tokenBStandard],
    [tokenA, tokenB, FeeAmount.MEDIUM, tokenAStandard, tokenBStandard],
    [tokenA, tokenB, FeeAmount.HIGH, tokenAStandard, tokenBStandard],
  ]);

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

  useEffect(() => {
    if (tier || isLoading || isError) {
      return;
    }

    if (!largestUsageFeeTier) {
      // cannot recommend, open options
      setShowOptions(true);
    } else {
      setShowOptions(false);

      // recommended.current = true

      // handleFeePoolSelect(largestUsageFeeTier)
    }
  }, [
    tier,
    isLoading,
    isError,
    largestUsageFeeTier,
    //  handleFeePoolSelect,
  ]);

  useEffect(() => {
    setShowOptions(isError);
  }, [isError]);

  return (
    <div className="rounded-3 mb-5 bg-secondary-bg">
      <div
        role="button"
        onClick={() => setIsFeeOpened(!isFeeOpened)}
        className={clsx(
          "flex justify-between items-center pb-[18px] pt-5 px-5 rounded-3 duration-200",
          !isFeeOpened && "hover:bg-green-bg",
        )}
      >
        <div className="flex items-center gap-2">
          <span className="font-bold">{FEE_AMOUNT_DETAIL[tier].label}% fee tier</span>
          {/*<TextLabel text="67% select" color="grey"/>*/}
        </div>
        <span className="flex items-center gap-1 group">
          <span className="text-secondary-text">{isFeeOpened ? "Hide" : "Edit"}</span>
          <Svg
            iconName="expand-arrow"
            className={isFeeOpened ? "duration-200 -rotate-180" : "duration-200 "}
          />
        </span>
      </div>
      <Collapse open={isFeeOpened}>
        <div className="grid gap-2 pb-5 px-5">
          {FEE_TIERS.map((_feeAmount) => (
            <FeeAmountOption
              feeAmount={_feeAmount}
              key={_feeAmount}
              active={tier === _feeAmount}
              distributions={distributions}
              poolState={poolsByFeeTier[_feeAmount]}
              onClick={() => {
                setTier(_feeAmount);
                clearPriceRange();
                // window.history.replaceState(
                //   null,
                //   "",
                //   `/${locale}/add/${tokenA?.address0}/${tokenB?.address0}/${_feeAmount}`,
                // );
              }}
            />
          ))}
        </div>
      </Collapse>
    </div>
  );
}
