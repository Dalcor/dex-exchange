"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";

import Container from "@/components/atoms/Container";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import RangeBadge, { PositionRangeStatus } from "@/components/badges/RangeBadge";
import Button, { ButtonSize } from "@/components/buttons/Button";
import TabButton from "@/components/buttons/TabButton";
import TokensPair from "@/components/common/TokensPair";
import { FEE_AMOUNT_DETAIL } from "@/config/constants/liquidityFee";
import usePositions, {
  usePositionFromPositionInfo,
  usePositionRangeStatus,
} from "@/hooks/usePositions";
import { useRouter } from "@/navigation";
import { FeeAmount } from "@/sdk_hybrid/constants";

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
      className="px-5 py-4 rounded-3 bg-secondary-bg hover:bg-secondary-bg duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="justify-between flex items-center mb-2">
        <div className="flex items-center gap-2">
          <TokensPair tokenA={tokenA} tokenB={tokenB} />
          {fee ? (
            <Badge variant={BadgeVariant.DEFAULT} text={`${FEE_AMOUNT_DETAIL[fee].label}%`} />
          ) : (
            <Badge variant={BadgeVariant.DEFAULT} text="loading..." />
          )}
        </div>
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
      <div className="hidden md:flex gap-2 items-center">
        <span className="text-secondary-text">Min:</span> {minTokenAPerTokenB} {tokenA?.symbol} per{" "}
        {tokenB?.symbol}
        <Svg iconName="double-arrow" />
        <span className="text-secondary-text">Max:</span> {maxTokenAPerTokenB} {tokenA?.symbol} per{" "}
        {tokenB?.symbol}
      </div>
      <div className="flex md:hidden gap-2 items-center">
        <Svg iconName="double-arrow" className="rotate-90 text-secondary-text" size={40} />
        <div className="flex flex-col text-14 gap-1">
          <div>
            {" "}
            <span className="text-secondary-text">Min:</span> {minTokenAPerTokenB} {tokenA?.symbol}{" "}
            per {tokenB?.symbol}
          </div>
          <div>
            <span className="text-secondary-text">Max:</span> {maxTokenAPerTokenB} {tokenA?.symbol}{" "}
            per {tokenB?.symbol}
          </div>
        </div>
      </div>
    </div>
  );
}

const MyPositions = () => {
  const { isConnected } = useAccount();
  const router = useRouter();

  const { loading, positions } = usePositions();

  return (
    <div className="w-full">
      {loading ? (
        <div className="w-full">
          <div className="min-h-[340px] bg-primary-bg flex items-center justify-center w-full flex-col gap-2 rounded-5">
            <Preloader size={50} type="awaiting" />
          </div>
        </div>
      ) : (
        <>
          {!isConnected ? (
            <div className="w-full">
              <div className="min-h-[340px] bg-primary-bg flex items-center justify-center w-full flex-col gap-2 rounded-5">
                <EmptyStateIcon iconName="wallet" />
                <p className="text-16 text-secondary-text">
                  Connect to a wallet to see your liquidity
                </p>
              </div>
            </div>
          ) : (
            <>
              {positions?.length ? (
                <div className="rounded-5 w-full overflow-hidden bg-primary-bg md:px-10 px-5">
                  <div className="flex justify-between py-3">
                    <span className="text-secondary-text">Your positions</span>
                    <span className="text-green">Hide closed positions</span>
                  </div>
                  <div className="flex flex-col gap-3 pb-10">
                    {positions?.length ? (
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
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div className="min-h-[340px] bg-primary-bg flex items-center justify-center w-full flex-col gap-2 rounded-5">
                    <EmptyStateIcon iconName="pool" />
                    <p className="text-16 text-secondary-text">
                      Your active liquidity positions will appear here
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default function PoolsPage() {
  const router = useRouter();

  return (
    <Container>
      <div className="py-[40px] px-10 flex flex-col items-center">
        <div className="flex w-full justify-between items-center mb-6">
          <div className="w-[300px] grid grid-cols-2 bg-secondary-bg p-1 gap-1 rounded-3">
            <TabButton
              inactiveBackground="bg-primary-bg"
              size={48}
              active={false}
              onClick={() => router.push("/pools")}
            >
              Pools
            </TabButton>
            <TabButton inactiveBackground="bg-primary-bg" size={48} active>
              My positions
            </TabButton>
          </div>
          <Button size={ButtonSize.LARGE} onClick={() => router.push("/add")}>
            <span className="flex items-center gap-2">
              New position
              <Svg iconName="add" />
            </span>
          </Button>
        </div>
        <MyPositions />
      </div>
    </Container>
  );
}
