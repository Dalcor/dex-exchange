"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";

import AwaitingLoader from "@/components/atoms/AwaitingLoader";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Svg from "@/components/atoms/Svg";
import Badge from "@/components/badges/Badge";
import RangeBadge from "@/components/badges/RangeBadge";
import TokensPair from "@/components/others/TokensPair";
import { FEE_AMOUNT_DETAIL } from "@/config/constants/liquidityFee";
import usePositions, {
  usePositionFromPositionInfo,
  usePositionRangeStatus,
} from "@/hooks/usePositions";
import { useRouter } from "@/navigation";
import { FeeAmount } from "@/sdk";

type PositionInfo = {
  nonce: bigint;
  operator: `0x${string}`;
  token0: `0x${string}`;
  token1: `0x${string}`;
  tier: FeeAmount;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  feeGrowthInside0LastX128: bigint;
  feeGrowthInside1LastX128: bigint;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
  tokenId: bigint | undefined;
};

function PoolPosition({ onClick, positionInfo }: { onClick: any; positionInfo: PositionInfo }) {
  const position = usePositionFromPositionInfo(positionInfo);

  const [tokenA, tokenB, fee] = useMemo(() => {
    return position?.pool.token0 && position?.pool.token1 && position?.pool.fee
      ? [position.pool.token0, position.pool.token1, position.pool.fee]
      : [undefined, undefined];
  }, [position?.pool.fee, position?.pool.token0, position?.pool.token1]);

  const minTokenAPerTokenB = useMemo(() => {
    return position?.token0PriceLower.invert().toSignificant() || "0";
  }, [position?.token0PriceLower]);

  const maxTokenAPerTokenB = useMemo(() => {
    return position?.token0PriceUpper.invert().toSignificant() || "0";
  }, [position?.token0PriceUpper]);

  const { inRange, removed } = usePositionRangeStatus({ position });

  return (
    <div
      role="button"
      className="px-5 py-4 border-t border-secondary-border hover:bg-secondary-bg duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="justify-between flex items-center mb-2">
        <div className="flex items-center gap-2">
          <TokensPair tokenA={tokenA} tokenB={tokenB} />
          {fee ? (
            <Badge color="grey" text={`${FEE_AMOUNT_DETAIL[fee].label}%`} />
          ) : (
            <Badge color="grey" text="loading..." />
          )}
        </div>
        <RangeBadge status={removed ? "closed" : inRange ? "in-range" : "out-of-range"} />
      </div>
      <div className="flex gap-2 items-center">
        <span className="text-secondary-text">Min:</span> {minTokenAPerTokenB} {tokenA?.symbol} per{" "}
        {tokenB?.symbol}
        <Svg iconName="double-arrow" />
        <span className="text-secondary-text">Max:</span> {maxTokenAPerTokenB} {tokenA?.symbol} per{" "}
        {tokenB?.symbol}
      </div>
    </div>
  );
}

export default function PoolsPage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  const { loading, positions } = usePositions();

  return (
    <Container>
      <div className="py-[80px] flex justify-center">
        <div className="w-full">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-24">Pools</h1>
            <Button size="regular" onClick={() => router.push("/add")}>
              <span className="flex items-center gap-2">
                New position
                <Svg iconName="add" />
              </span>
            </Button>
          </div>
          {!isConnected ? (
            <div className="w-full">
              <div className="min-h-[340px] bg-primary-bg flex items-center justify-center w-full flex-col gap-4">
                <EmptyStateIcon iconName="wallet" />
                <p className="text-16 text-secondary-text">
                  Connect to a wallet to see your liquidity
                </p>
              </div>
            </div>
          ) : (
            <div className="border rounded-2 border-secondary-border bg-primary-bg w-full overflow-hidden">
              <div className="flex justify-between px-5 py-3">
                <span>Your positions</span>
                <span className="text-green">Hide closed positions</span>
              </div>
              {loading ? (
                <div className="py-10 flex justify-center items-center">
                  <AwaitingLoader />
                </div>
              ) : (
                <>
                  {positions ? (
                    positions.map((position) => {
                      return (
                        <PoolPosition
                          positionInfo={position}
                          key={(position as any).nonce}
                          onClick={() =>
                            router.push(`/pool/${(position as any).tokenId.toString()}`)
                          }
                        />
                      );
                    })
                  ) : (
                    <div>You have no positions yet</div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
