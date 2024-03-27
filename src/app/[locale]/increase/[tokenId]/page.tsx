"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";

import PositionLiquidityCard from "@/app/[locale]/add/[[...currency]]/components/PositionLiquidityCard";
import PositionPriceRangeCard from "@/app/[locale]/add/[[...currency]]/components/PositionPriceRangeCard";
import { Bound } from "@/app/[locale]/add/[[...currency]]/components/PriceRange/LiquidityChartRangeInput/types";
import useAddLiquidity from "@/app/[locale]/add/[[...currency]]/hooks/useAddLiquidity";
import { useLiquidityTierStore } from "@/app/[locale]/add/[[...currency]]/hooks/useLiquidityTierStore";
import { useAddLiquidityTokensStore } from "@/app/[locale]/add/[[...currency]]/stores/useAddLiquidityTokensStore";
import { useLiquidityPriceRangeStore } from "@/app/[locale]/add/[[...currency]]/stores/useLiquidityPriceRangeStore";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Svg from "@/components/atoms/Svg";
import RangeBadge from "@/components/badges/RangeBadge";
import SystemIconButton from "@/components/buttons/SystemIconButton";
import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import TokensPair from "@/components/others/TokensPair";
import { FEE_AMOUNT_DETAIL } from "@/config/constants/liquidityFee";
import {
  usePositionFromPositionInfo,
  usePositionFromTokenId,
  usePositionPrices,
  usePositionRangeStatus,
} from "@/hooks/usePositions";
import { useRouter } from "@/navigation";

import DepositAmount from "../../add/[[...currency]]/components/DepositAmount";

export default function IncreaseLiquidityPage({
  params,
}: {
  params: {
    tokenId: string;
  };
}) {
  const { setIsOpen } = useTransactionSettingsDialogStore();
  const { setTicks } = useLiquidityPriceRangeStore();

  const router = useRouter();

  const { handleAddLiquidity } = useAddLiquidity();

  const [showFirst, setShowFirst] = useState(true);

  const { position: positionInfo, loading } = usePositionFromTokenId(BigInt(params.tokenId));
  const position = usePositionFromPositionInfo(positionInfo);

  const [tokenA, tokenB, fee] = useMemo(() => {
    return position?.pool.token0 && position?.pool.token1 && position?.pool.fee
      ? [position.pool.token0, position.pool.token1, position.pool.fee]
      : [undefined, undefined];
  }, [position?.pool.fee, position?.pool.token0, position?.pool.token1]);

  const { inRange, removed } = usePositionRangeStatus({ position });
  const { minPriceString, maxPriceString, currentPriceString, ratio } = usePositionPrices({
    position,
    showFirst,
  });

  const [initialized, setInitialized] = useState(false);

  const { setBothTokens } = useAddLiquidityTokensStore();
  const { setTier } = useLiquidityTierStore();

  useEffect(() => {
    if (tokenA && tokenB && position && !initialized) {
      setBothTokens({ tokenA, tokenB });
      setTier(position.pool.fee);
      setTicks({
        [Bound.LOWER]: position.tickLower,
        [Bound.UPPER]: position.tickUpper,
      });
      setInitialized(true);
    }
  }, [initialized, position, setBothTokens, setTicks, setTier, tokenA, tokenB]);

  return (
    <Container>
      <div className="w-[600px] bg-primary-bg mx-auto my-[80px]">
        <div className="flex justify-between items-center rounded-t-2 border py-2.5 px-6 border-secondary-border">
          <SystemIconButton
            onClick={() => router.push(`/pool/${params.tokenId}`)}
            size="large"
            iconName="back"
            iconSize={32}
          />
          <h2 className="text-20 font-bold">Increase Liquidity</h2>
          <SystemIconButton
            onClick={() => setIsOpen(true)}
            size="large"
            iconName="settings"
            iconSize={32}
          />
        </div>
        <div className="rounded-b-2 border border-secondary-border border-t-0 p-10 bg-primary-bg">
          <div className="flex items-center justify-between mb-5">
            <TokensPair tokenA={tokenA} tokenB={tokenB} />
            <RangeBadge status={removed ? "closed" : inRange ? "in-range" : "out-of-range"} />
          </div>

          <div className="border border-secondary-border rounded-1 bg-secondary-bg mb-5">
            <div className="grid gap-3 px-5 py-3 border-b border-secondary-border">
              <PositionLiquidityCard
                token={tokenA}
                amount={position?.amount0.toSignificant() || "Loading..."}
                percentage={ratio ? (showFirst ? ratio : 100 - ratio) : "Loading..."}
              />
              <PositionLiquidityCard
                token={tokenB}
                amount={position?.amount1.toSignificant() || "Loading..."}
                percentage={ratio ? (!showFirst ? ratio : 100 - ratio) : "Loading..."}
              />
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <span className="font-bold">Fee tier</span>
              <span>{position ? FEE_AMOUNT_DETAIL[position?.pool.fee].label : "Loading..."}%</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-3">
            <span className="bold text-secondary-text">Selected range</span>
            <div className="flex gap-1">
              <button
                onClick={() => setShowFirst(true)}
                className={clsx(
                  "text-12 h-7 rounded-1 min-w-[60px] px-3 border duration-200",
                  showFirst
                    ? "bg-green-bg border-green text-primary-text"
                    : "hover:bg-green-bg bg-primary-bg border-transparent text-secondary-text",
                )}
              >
                {tokenA?.symbol}
              </button>
              <button
                onClick={() => setShowFirst(false)}
                className={clsx(
                  "text-12 h-7 rounded-1 min-w-[60px] px-3 border duration-200",
                  !showFirst
                    ? "bg-green-bg border-green text-primary-text"
                    : "hover:bg-green-bg bg-primary-bg border-transparent text-secondary-text",
                )}
              >
                {tokenB?.symbol}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_20px_1fr] mb-5">
            <PositionPriceRangeCard
              showFirst={showFirst}
              token0={tokenA}
              token1={tokenB}
              price={minPriceString}
            />
            <div className="relative">
              <div className="bg-primary-bg border border-secondary-border w-12 h-12 rounded-1 text-placeholder-text absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <Svg iconName="double-arrow" />
              </div>
            </div>
            <PositionPriceRangeCard
              showFirst={showFirst}
              token0={tokenA}
              token1={tokenB}
              price={maxPriceString}
              isMax
            />
          </div>

          <div className="bg-secondary-bg flex items-center justify-center flex-col py-3 border rounded-1 border-secondary-border mb-5">
            <div className="text-14 text-secondary-text">Current price</div>
            <div className="text-18">{currentPriceString}</div>
            <div className="text-14 text-secondary-text">
              {showFirst
                ? `${tokenA?.symbol} per ${tokenB?.symbol}`
                : `${tokenB?.symbol} per ${tokenA?.symbol}`}
            </div>
          </div>

          <div className="mb-5">
            <DepositAmount />
          </div>

          <Button
            onClick={() => {
              if (position) {
                handleAddLiquidity(position, true);
              }
            }}
            fullWidth
          >
            Add liquidity
          </Button>
        </div>
      </div>
    </Container>
  );
}
