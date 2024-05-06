"use client";

import clsx from "clsx";
import { useMemo, useState } from "react";

import PositionLiquidityCard from "@/app/[locale]/pool/[tokenId]/components/PositionLiquidityCard";
import PositionPriceRangeCard from "@/app/[locale]/pool/[tokenId]/components/PositionPriceRangeCard";
import Container from "@/components/atoms/Container";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import RangeBadge, { PositionRangeStatus } from "@/components/badges/RangeBadge";
import Button, { ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import IconButton, { IconButtonSize } from "@/components/buttons/IconButton";
import RecentTransactions from "@/components/others/RecentTransactions";
import SelectedTokensInfo from "@/components/others/SelectedTokensInfo";
import TokensPair from "@/components/others/TokensPair";
import { FEE_AMOUNT_DETAIL } from "@/config/constants/liquidityFee";
import {
  usePositionFees,
  usePositionFromPositionInfo,
  usePositionFromTokenId,
  usePositionPrices,
  usePositionRangeStatus,
} from "@/hooks/usePositions";
import { useRecentTransactionTracking } from "@/hooks/useRecentTransactionTracking";
import { useRouter } from "@/navigation";

export default function PoolPage({
  params,
}: {
  params: {
    tokenId: string;
  };
}) {
  useRecentTransactionTracking();
  const [showRecentTransactions, setShowRecentTransactions] = useState(true);

  const router = useRouter();

  //TODO: make centralize function instead of boolean useState value to control invert
  const [showFirst, setShowFirst] = useState(true);

  const { position: positionInfo, loading } = usePositionFromTokenId(BigInt(params.tokenId));
  const position = usePositionFromPositionInfo(positionInfo);
  const { fees, handleCollectFees } = usePositionFees(position?.pool, positionInfo?.tokenId);

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

  return (
    <Container>
      <div className="w-[800px] mx-auto mt-[80px] mb-5 bg-primary-bg px-10 pb-10">
        <div className="flex justify-between items-center py-1.5 -mx-3">
          <button
            onClick={() => router.push("/pools")}
            className="flex items-center w-12 h-12 justify-center"
          >
            <Svg iconName="back" />
          </button>
          <h2 className="text-20 font-bold">Position</h2>
          <IconButton
            buttonSize={IconButtonSize.LARGE}
            iconName="recent-transactions"
            onClick={() => setShowRecentTransactions(!showRecentTransactions)}
          />
        </div>

        <div className="w-full flex justify-between mb-5">
          <div className="flex items-center gap-2">
            <TokensPair tokenA={position?.pool.token0} tokenB={position?.pool.token1} />
            {position && (
              <Badge
                text={`${FEE_AMOUNT_DETAIL[position.pool.fee].label}%`}
                variant={BadgeVariant.DEFAULT}
              />
            )}
            <RangeBadge
              status={
                removed
                  ? PositionRangeStatus.CLOSED
                  : inRange
                    ? PositionRangeStatus.IN_RANGE
                    : PositionRangeStatus.OUT_OF_RANGE
              }
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center gap-1 px-3 py-2 rounded-2 bg-tertiary-bg">
            <Tooltip text="Tooltip text" />
            <span className="text-secondary-text">NFT ID:</span>
            {params.tokenId}
            <button>
              <Svg iconName="arrow-up" />
            </button>
          </div>
          <div className="flex items-center gap-1 px-3 py-2 rounded-2 bg-tertiary-bg">
            <Tooltip text="Tooltip text" />
            <span className="text-secondary-text">Min tick:</span>
            {position?.tickLower}
          </div>
          <div className="flex items-center gap-1 px-3 py-2 rounded-2 bg-tertiary-bg">
            <Tooltip text="Tooltip text" />
            <span className="text-secondary-text">Max tick:</span>
            {position?.tickUpper}
          </div>
        </div>
        <div className="grid grid-cols-2 items-center gap-3 mb-5">
          <Button
            size={ButtonSize.SMALL}
            onClick={() => router.push(`/increase/${params.tokenId}`)}
            variant={ButtonVariant.OUTLINED}
            fullWidth
          >
            Increase liquidity
          </Button>
          <Button
            size={ButtonSize.SMALL}
            onClick={() => router.push(`/remove/${params.tokenId}`)}
            variant={ButtonVariant.OUTLINED}
            fullWidth
          >
            Remove liquidity
          </Button>
        </div>

        <div className="p-5 bg-tertiary-bg mb-5 rounded-3">
          <div>
            <h3 className="text-14">Liquidity</h3>
            <p className="text-20 font-bold mb-3">$0.00</p>
            <div className="p-5 grid gap-3 rounded-1 bg-quaternary-bg">
              <PositionLiquidityCard
                token={tokenA}
                standards={["ERC-20", "ERC-223"]}
                amount={position?.amount0.toSignificant() || "Loading..."}
                percentage={ratio ? (showFirst ? ratio : 100 - ratio) : "Loading..."}
              />
              <PositionLiquidityCard
                token={tokenB}
                standards={["ERC-20", "ERC-223"]}
                amount={position?.amount1.toSignificant() || "Loading..."}
                percentage={ratio ? (!showFirst ? ratio : 100 - ratio) : "Loading..."}
              />
            </div>
          </div>
        </div>
        <div className="p-5 bg-tertiary-bg mb-5 rounded-3">
          <div>
            <div className="flex justify-between">
              <div>
                <h3 className="text-14">Unclaimed fees</h3>
                <p className="text-20 font-bold mb-3 text-green">$0.00</p>
              </div>
              <Button onClick={handleCollectFees} size={ButtonSize.SMALL}>
                Collect fees
              </Button>
            </div>

            <div className="p-5 grid gap-3 rounded-1 bg-quaternary-bg">
              <PositionLiquidityCard
                token={tokenA}
                standards={["ERC-20", "ERC-223"]}
                amount={fees[0]?.toSignificant(2) || "Loading..."}
              />
              <PositionLiquidityCard
                token={tokenB}
                standards={["ERC-20", "ERC-223"]}
                amount={fees[1]?.toSignificant(2) || "Loading..."}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span>Selected Range</span>
              <RangeBadge
                status={
                  removed
                    ? PositionRangeStatus.CLOSED
                    : inRange
                      ? PositionRangeStatus.IN_RANGE
                      : PositionRangeStatus.OUT_OF_RANGE
                }
              />
            </div>
            <div className="flex gap-0.5 bg-secondary-bg rounded-2 p-0.5">
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
              <div className="bg-primary-bg w-12 h-12 rounded-full text-tertiary-text absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
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
          <div className="rounded-3 overflow-hidden">
            <div className="bg-tertiary-bg flex items-center justify-center flex-col py-3">
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
      </div>
      <div className="w-[800px] mx-auto mb-[80px] gap-5 flex flex-col">
        <SelectedTokensInfo tokenA={tokenA} tokenB={tokenB} />
        <RecentTransactions
          showRecentTransactions={showRecentTransactions}
          handleClose={() => setShowRecentTransactions(false)}
          pageSize={5}
        />
      </div>
    </Container>
  );
}
