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
import SelectedTokensInfo from "@/components/others/SelectedTokensInfo";
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
import { useRecentTransactionTracking } from "@/stores/useRecentTransactionTracking";

import { DepositAmounts } from "../../add/[[...currency]]/components/DepositAmounts/DepositAmounts";
import { PoolsRecentTransactions } from "../../add/[[...currency]]/components/PoolsRecentTransactions";
import { usePriceRange } from "../../add/[[...currency]]/hooks/usePrice";
import { Field } from "../../swap/stores/useSwapAmountsStore";

export default function IncreaseLiquidityPage({
  params,
}: {
  params: {
    tokenId: string;
  };
}) {
  useRecentTransactionTracking();
  const [showRecentTransactions, setShowRecentTransactions] = useState(true);

  const { setIsOpen } = useTransactionSettingsDialogStore();
  const { setTicks } = useLiquidityPriceRangeStore();

  const router = useRouter();

  const { handleAddLiquidity } = useAddLiquidity();

  const [showFirst, setShowFirst] = useState(true);

  const { position: positionInfo, loading } = usePositionFromTokenId(BigInt(params.tokenId));
  const existedPosition = usePositionFromPositionInfo(positionInfo);

  const [tokenA, tokenB, fee] = useMemo(() => {
    return existedPosition?.pool.token0 && existedPosition?.pool.token1 && existedPosition?.pool.fee
      ? [existedPosition.pool.token0, existedPosition.pool.token1, existedPosition.pool.fee]
      : [undefined, undefined];
  }, [existedPosition?.pool.fee, existedPosition?.pool.token0, existedPosition?.pool.token1]);

  const { inRange, removed } = usePositionRangeStatus({ position: existedPosition });
  const { minPriceString, maxPriceString, currentPriceString, ratio } = usePositionPrices({
    position: existedPosition,
    showFirst,
  });

  const [initialized, setInitialized] = useState(false);

  const { setBothTokens } = useAddLiquidityTokensStore();
  const { tier, setTier } = useLiquidityTierStore();

  useEffect(() => {
    if (tokenA && tokenB && existedPosition && !initialized) {
      setBothTokens({ tokenA, tokenB });
      setTier(existedPosition.pool.fee);
      setTicks({
        [Bound.LOWER]: existedPosition.tickLower,
        [Bound.UPPER]: existedPosition.tickUpper,
      });
      setInitialized(true);
    }
  }, [initialized, existedPosition, setBothTokens, setTicks, setTier, tokenA, tokenB]);

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
  const {
    parsedAmounts,
    position,
    currencies,
    noLiquidity,
    outOfRange,
    depositADisabled,
    depositBDisabled,
  } = useV3DerivedMintInfo({
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
    writeTokenRevoke: revokeA,
    isRevoking: isRevokingA,
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
    writeTokenRevoke: revokeB,
    isApproving: isApprovingB,
    currentAllowance: currentAllowanceB,
    isRevoking: isRevokingB,
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
    writeTokenWithdraw: withdrawA,
    isDepositing: isDepositingA,
    currentDeposit: currentDepositA,
    isWithdrawing: isWithdrawingA,
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
    writeTokenWithdraw: withdrawB,
    isDepositing: isDepositingB,
    currentDeposit: currentDepositB,
    isWithdrawing: isWithdrawingB,
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
      <div className="w-[1200px] mx-auto my-[80px]">
        <div className="flex justify-between items-center bg-primary-bg rounded-t-3 py-2.5 px-6">
          <SystemIconButton
            onClick={() => router.push(`/pool/${params.tokenId}`)}
            size="large"
            iconName="back"
            iconSize={32}
          />
          <h2 className="text-20 font-bold">Increase Liquidity</h2>
          <div className="flex">
            <SystemIconButton
              iconSize={24}
              size="large"
              iconName="recent-transactions"
              onClick={() => setShowRecentTransactions(!showRecentTransactions)}
            />
            <SystemIconButton
              iconSize={24}
              size="large"
              iconName="settings"
              onClick={() => setIsOpen(true)}
            />
          </div>
        </div>
        <div className="flex flex-col bg-primary-bg px-10 pb-10 mb-5 rounded-3 rounded-t-0">
          <div className="flex items-start mb-5 gap-2">
            <TokensPair tokenA={tokenA} tokenB={tokenB} />
            <RangeBadge status={removed ? "closed" : inRange ? "in-range" : "out-of-range"} />
          </div>

          <div className="grid gap-5 grid-cols-2 mb-5">
            <DepositAmounts
              parsedAmounts={parsedAmounts}
              currencies={currencies}
              currentAllowanceA={currentAllowanceA}
              currentAllowanceB={currentAllowanceB}
              currentDepositA={currentDepositA}
              currentDepositB={currentDepositB}
              revokeA={revokeA}
              revokeB={revokeB}
              withdrawA={withdrawA}
              withdrawB={withdrawB}
              depositADisabled={depositADisabled}
              depositBDisabled={depositBDisabled}
              isRevokingA={isRevokingA}
              isRevokingB={isRevokingB}
              isWithdrawingA={isWithdrawingA}
              isWithdrawingB={isWithdrawingB}
            />
            <div className="rounded-3 p-5 bg-tertiary-bg h-min">
              <div className="rounded-3 bg-quaternary-bg mb-4">
                <div className="grid gap-3 px-5 py-3 border-b border-secondary-border">
                  <PositionLiquidityCard
                    token={tokenA}
                    amount={existedPosition?.amount0.toSignificant() || "Loading..."}
                    percentage={ratio ? (showFirst ? ratio : 100 - ratio) : "Loading..."}
                    standards={["ERC-20", "ERC-223"]} // TODO
                  />
                  <PositionLiquidityCard
                    token={tokenB}
                    amount={existedPosition?.amount1.toSignificant() || "Loading..."}
                    percentage={ratio ? (!showFirst ? ratio : 100 - ratio) : "Loading..."}
                    standards={["ERC-20", "ERC-223"]} // TODO
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mb-5">
                <span className="font-bold">Fee tier</span>
                <span>
                  {existedPosition
                    ? FEE_AMOUNT_DETAIL[existedPosition?.pool.fee].label
                    : "Loading..."}
                  %
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
                handleAddLiquidity({ position, increase: true, tokenId: params.tokenId });
              }
            }}
            fullWidth
          >
            Add liquidity
          </Button>
        </div>
        <SelectedTokensInfo tokenA={tokenA} tokenB={tokenB} />
        <PoolsRecentTransactions
          isOpen={showRecentTransactions}
          onClose={() => {
            setShowRecentTransactions(false);
          }}
        />
      </div>
    </Container>
  );
}
