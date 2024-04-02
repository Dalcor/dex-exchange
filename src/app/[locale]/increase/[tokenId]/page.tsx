"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { parseUnits } from "viem";

import { Bound } from "@/app/[locale]/add/[[...currency]]/components/PriceRange/LiquidityChartRangeInput/types";
import {
  useAddLiquidity,
  useV3DerivedMintInfo,
} from "@/app/[locale]/add/[[...currency]]/hooks/useAddLiquidity";
import { useAddLiquidityTokensStore } from "@/app/[locale]/add/[[...currency]]/stores/useAddLiquidityTokensStore";
import { useLiquidityPriceRangeStore } from "@/app/[locale]/add/[[...currency]]/stores/useLiquidityPriceRangeStore";
import { useLiquidityTierStore } from "@/app/[locale]/add/[[...currency]]/stores/useLiquidityTierStore";
import PositionLiquidityCard from "@/app/[locale]/pool/[tokenId]/components/PositionLiquidityCard";
import PositionPriceRangeCard from "@/app/[locale]/pool/[tokenId]/components/PositionPriceRangeCard";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Svg from "@/components/atoms/Svg";
import RangeBadge from "@/components/badges/RangeBadge";
import SystemIconButton from "@/components/buttons/SystemIconButton";
import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import TokensPair from "@/components/others/TokensPair";
import { FEE_AMOUNT_DETAIL } from "@/config/constants/liquidityFee";
import { nonFungiblePositionManagerAddress } from "@/config/contracts";
import useAllowance from "@/hooks/useAllowance";
import useDeposit from "@/hooks/useDeposit";
import {
  usePositionFromPositionInfo,
  usePositionFromTokenId,
  usePositionPrices,
  usePositionRangeStatus,
} from "@/hooks/usePositions";
import { useRouter } from "@/navigation";

import { DepositAmounts } from "../../add/[[...currency]]/components/DepositAmounts/DepositAmounts";
import { usePriceRange } from "../../add/[[...currency]]/hooks/usePrice";
import { Field } from "../../swap/stores/useSwapAmountsStore";

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
  const { tier, setTier } = useLiquidityTierStore();

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

  // PRICE RANGE HOOK START
  const {
    formattedPrice,
    invertPrice,
    price,
    pricesAtTicks,
    ticksAtLimit,
    isFullRange,
    isSorted,
    leftPrice,
    rightPrice,
    token0,
    token1,
    tickSpaceLimits,
  } = usePriceRange();
  // PRICE RANGE HOOK END

  // Deposit Amounts START
  const { parsedAmounts, currencies, noLiquidity } = useV3DerivedMintInfo({
    tokenA,
    tokenB,
    tier,
    price,
  });

  const {
    isAllowed: isAllowedA,
    writeTokenApprove: approveA,
    isApproving: isApprovingA,
    currentAllowance: currentAllowanceA,
  } = useAllowance({
    token: tokenA,
    contractAddress: nonFungiblePositionManagerAddress,
    // TODO: mb better way to convert CurrencyAmount to bigint
    amountToCheck: parseUnits(
      parsedAmounts[Field.CURRENCY_A]?.toSignificant() || "",
      tokenA?.decimals || 18,
    ),
  });

  const {
    isAllowed: isAllowedB,
    writeTokenApprove: approveB,
    isApproving: isApprovingB,
    currentAllowance: currentAllowanceB,
  } = useAllowance({
    token: tokenB,
    contractAddress: nonFungiblePositionManagerAddress,
    // TODO: mb better way to convert CurrencyAmount to bigint
    amountToCheck: parseUnits(
      parsedAmounts[Field.CURRENCY_B]?.toSignificant() || "",
      tokenB?.decimals || 18,
    ),
  });

  const {
    isDeposited: isDepositedA,
    writeTokenDeposit: depositA,
    isDepositing: isDepositingA,
    currentDeposit: currentDepositA,
  } = useDeposit({
    token: tokenA,
    contractAddress: nonFungiblePositionManagerAddress,
    // TODO: mb better way to convert CurrencyAmount to bigint
    amountToCheck: parseUnits(
      parsedAmounts[Field.CURRENCY_A]?.toSignificant() || "",
      tokenA?.decimals || 18,
    ),
  });
  const {
    isDeposited: isDepositedB,
    writeTokenDeposit: depositB,
    isDepositing: isDepositingB,
    currentDeposit: currentDepositB,
  } = useDeposit({
    token: tokenB,
    contractAddress: nonFungiblePositionManagerAddress,
    // TODO: mb better way to convert CurrencyAmount to bigint
    amountToCheck: parseUnits(
      parsedAmounts[Field.CURRENCY_B]?.toSignificant() || "",
      tokenB?.decimals || 18,
    ),
  });

  // Deposit Amounts END

  return (
    <Container>
      <div className="w-[1200px] bg-primary-bg mx-auto my-[80px]">
        <div className="flex justify-between items-center rounded-t-2 py-2.5 px-6">
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
        <div className="flex flex-col px-10 pb-10">
          <div className="flex items-start mb-5 gap-2">
            <TokensPair tokenA={tokenA} tokenB={tokenB} />
            <RangeBadge status={removed ? "closed" : inRange ? "in-range" : "out-of-range"} />
          </div>

          <div className="grid gap-5 grid-cols-2 mb-5">
            <DepositAmounts
              parsedAmounts={parsedAmounts}
              position={position}
              currencies={currencies}
              currentAllowanceA={currentAllowanceA}
              currentAllowanceB={currentAllowanceB}
              currentDepositA={currentDepositA}
              currentDepositB={currentDepositB}
            />
            <div className="rounded-3 p-5 bg-tertiary-bg h-min">
              <div className="rounded-3 bg-quaternary-bg mb-4">
                <div className="grid gap-3 px-5 py-3 border-b border-secondary-border">
                  <PositionLiquidityCard
                    token={tokenA}
                    amount={position?.amount0.toSignificant() || "Loading..."}
                    percentage={ratio ? (showFirst ? ratio : 100 - ratio) : "Loading..."}
                    standards={["ERC-20", "ERC-223"]} // TODO
                  />
                  <PositionLiquidityCard
                    token={tokenB}
                    amount={position?.amount1.toSignificant() || "Loading..."}
                    percentage={ratio ? (!showFirst ? ratio : 100 - ratio) : "Loading..."}
                    standards={["ERC-20", "ERC-223"]} // TODO
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mb-5">
                <span className="font-bold">Fee tier</span>
                <span>
                  {position ? FEE_AMOUNT_DETAIL[position?.pool.fee].label : "Loading..."}%
                </span>
              </div>

              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-secondary-text">Selected range</span>
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

              <div className="grid grid-cols-[1fr_12px_1fr] mb-3">
                <PositionPriceRangeCard
                  showFirst={showFirst}
                  token0={tokenA}
                  token1={tokenB}
                  price={minPriceString}
                />
                <div className="relative">
                  <div className="bg-primary-bg w-12 h-12 rounded-full text-placeholder-text absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
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

              <div className="bg-quaternary-bg flex items-center justify-center flex-col py-3 px-5 rounded-3">
                <div className="text-14 text-secondary-text">Current price</div>
                <div className="text-18">{currentPriceString}</div>
                <div className="text-14 text-secondary-text">
                  {showFirst
                    ? `${tokenA?.symbol} per ${tokenB?.symbol}`
                    : `${tokenB?.symbol} per ${tokenA?.symbol}`}
                </div>
              </div>
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
          <div className="grid gap-2 mb-5 grid-cols-2">
            {!isDepositedA && (
              <Button variant="outline" fullWidth onClick={() => depositA()}>
                {isDepositingA ? "Loading..." : <span>Deposit {tokenA?.symbol}</span>}
              </Button>
            )}
            {!isDepositedB && (
              <Button variant="outline" fullWidth onClick={() => depositB()}>
                {isDepositingB ? "Loading..." : <span>Deposit {tokenB?.symbol}</span>}
              </Button>
            )}
          </div>

          <Button
            onClick={() => {
              if (position) {
                handleAddLiquidity({ position, increase: true });
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
