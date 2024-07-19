"use client";

import clsx from "clsx";
import Image from "next/image";
import { useMemo, useState } from "react";

import PositionLiquidityCard from "@/app/[locale]/pool/[tokenId]/components/PositionLiquidityCard";
import PositionPriceRangeCard from "@/app/[locale]/pool/[tokenId]/components/PositionPriceRangeCard";
import Container from "@/components/atoms/Container";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import RangeBadge, { PositionRangeStatus } from "@/components/badges/RangeBadge";
import Button, { ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import IconButton, { IconButtonSize } from "@/components/buttons/IconButton";
import RadioButton from "@/components/buttons/RadioButton";
import RecentTransactions from "@/components/common/RecentTransactions";
import SelectedTokensInfo from "@/components/common/SelectedTokensInfo";
import TokensPair from "@/components/common/TokensPair";
import { FEE_AMOUNT_DETAIL } from "@/config/constants/liquidityFee";
import { formatFloat } from "@/functions/formatFloat";
import { AllowanceStatus } from "@/hooks/useAllowance";
import {
  usePositionFees,
  usePositionFromPositionInfo,
  usePositionFromTokenId,
  usePositionPrices,
  usePositionRangeStatus,
} from "@/hooks/usePositions";
import { useRecentTransactionTracking } from "@/hooks/useRecentTransactionTracking";
import { useRouter } from "@/navigation";
import { Standard } from "@/sdk_hybrid/standard";
import { useComputePoolAddressDex } from "@/sdk_hybrid/utils/computePoolAddress";

export default function PoolPage({
  params,
}: {
  params: {
    tokenId: string;
  };
}) {
  useRecentTransactionTracking();
  const [showRecentTransactions, setShowRecentTransactions] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [tokenAStandard, setTokenAStandard] = useState(Standard.ERC20);
  const [tokenBStandard, setTokenBStandard] = useState(Standard.ERC20);

  const tokensOutCode = useMemo(() => {
    // 0 >> both ERC-20
    // 1 >> 0 ERC-20, 1 ERC-223
    // 2 >> 0 ERC-223, 1 ERC-20
    // 3 >> both ERC-223
    if (tokenAStandard === Standard.ERC20 && tokenBStandard === Standard.ERC20) return 0;
    if (tokenAStandard === Standard.ERC20 && tokenBStandard === Standard.ERC223) return 1;
    if (tokenAStandard === Standard.ERC223 && tokenBStandard === Standard.ERC20) return 2;
    if (tokenAStandard === Standard.ERC223 && tokenBStandard === Standard.ERC223) return 3;
    return 0;
  }, [tokenAStandard, tokenBStandard]);
  const router = useRouter();

  //TODO: make centralize function instead of boolean useState value to control invert
  const [showFirst, setShowFirst] = useState(true);

  const { position: positionInfo, loading } = usePositionFromTokenId(BigInt(params.tokenId));
  const position = usePositionFromPositionInfo(positionInfo);

  const [tokenA, tokenB, fee] = useMemo(() => {
    return position?.pool.token0 && position?.pool.token1 && position?.pool.fee
      ? [position.pool.token0, position.pool.token1, position.pool.fee]
      : [undefined, undefined];
  }, [position?.pool.fee, position?.pool.token0, position?.pool.token1]);

  const { poolAddress, poolAddressLoading } = useComputePoolAddressDex({
    tokenA,
    tokenB,
    tier: fee,
  });

  const { fees, handleCollectFees, status } = usePositionFees({
    pool: position?.pool,
    poolAddress,
    tokenId: positionInfo?.tokenId,
  });

  const { inRange, removed } = usePositionRangeStatus({ position });
  const { minPriceString, maxPriceString, currentPriceString, ratio } = usePositionPrices({
    position,
    showFirst,
  });

  if (!tokenA || !tokenB) return <div>Error: Token A or B undefined</div>;

  return (
    <Container>
      <div className="w-full md:w-[800px] md:mx-auto md:mt-[40px] mb-5 bg-primary-bg px-10 pb-10 rounded-5">
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
            active={showRecentTransactions}
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
        <div className="flex items-center gap-3 mb-5 flex-wrap">
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
            size={ButtonSize.MEDIUM}
            onClick={() => router.push(`/increase/${params.tokenId}`)}
            variant={ButtonVariant.OUTLINED}
            fullWidth
          >
            Increase liquidity
          </Button>
          <Button
            size={ButtonSize.MEDIUM}
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
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-14">Unclaimed fees</h3>
                <p className="text-20 font-bold mb-3 text-green">$0.00</p>
              </div>
              <Button onClick={() => setIsOpen(true)} size={ButtonSize.MEDIUM}>
                Collect fees
              </Button>
            </div>

            <div className="p-5 grid gap-3 rounded-1 bg-quaternary-bg">
              <PositionLiquidityCard
                token={tokenA}
                standards={["ERC-20", "ERC-223"]}
                amount={fees[0]?.toSignificant() || "Loading..."}
              />
              <PositionLiquidityCard
                token={tokenB}
                standards={["ERC-20", "ERC-223"]}
                amount={fees[1]?.toSignificant() || "Loading..."}
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
              tokenA={tokenA}
              tokenB={tokenB}
              price={minPriceString}
            />
            <div className="relative">
              <div className="bg-primary-bg w-12 h-12 rounded-full text-tertiary-text absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <Svg iconName="double-arrow" />
              </div>
            </div>
            <PositionPriceRangeCard
              showFirst={showFirst}
              tokenA={tokenA}
              tokenB={tokenB}
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
      <div className="w-[800px] mx-auto mb-[40px] gap-5 flex flex-col">
        <SelectedTokensInfo tokenA={tokenA} tokenB={tokenB} />
        <RecentTransactions
          showRecentTransactions={showRecentTransactions}
          handleClose={() => setShowRecentTransactions(false)}
          pageSize={5}
        />
      </div>
      <div>
        <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
          <DialogHeader onClose={() => setIsOpen(false)} title="Claim fees" />
          <div className="px-4 md:px-10 md:w-[570px] pb-4 md:pb-10 h-[80dvh] md:h-auto overflow-y-auto">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="flex items-center relative w-12 h-[34px]">
                  <Image
                    className="absolute left-0 top-0"
                    width={32}
                    height={32}
                    src={tokenA.logoURI as any}
                    alt=""
                  />
                  <div className="w-[34px] h-[34px] flex absolute right-0 top-0 bg-tertiary-bg rounded-full items-center justify-center">
                    <Image width={32} height={32} src={tokenB.logoURI as any} alt="" />
                  </div>
                </div>
                <span className="text-18 font-bold">{`${tokenA.symbol} and ${tokenB.symbol}`}</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                {status === AllowanceStatus.PENDING && (
                  <>
                    <Preloader type="linear" />
                    <span className="text-secondary-text text-14">Proceed in your wallet</span>
                  </>
                )}
                {status === AllowanceStatus.LOADING && <Preloader size={20} />}
                {status === AllowanceStatus.SUCCESS && (
                  <Svg className="text-green" iconName="done" size={20} />
                )}
              </div>
            </div>
            {/* Standard A */}
            <div className="flex flex-col rounded-3 bg-tertiary-bg px-5 py-3 mt-4">
              <div className="flex gap-2 items-center mb-3">
                <Image width={32} height={32} src={tokenA.logoURI as any} alt="" />
                <span className="font-bold">{`Standard for collecting ${tokenA.symbol}`}</span>
              </div>
              <div className="flex flex-col gap-2">
                <RadioButton
                  isActive={tokenAStandard === Standard.ERC20}
                  onClick={() => setTokenAStandard(Standard.ERC20)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span>Standard</span>
                      <Badge color="green" text="ERC-20" />
                    </div>
                    <span className="text-16">
                      {`${formatFloat(fees[0]?.toSignificant() || "")} ${tokenA.symbol}`}
                    </span>
                  </div>
                </RadioButton>
                <RadioButton
                  isActive={tokenAStandard === Standard.ERC223}
                  onClick={() => setTokenAStandard(Standard.ERC223)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span>Standard</span>
                      <Badge color="green" text="ERC-223" />
                    </div>
                    <span className="text-16">
                      {`${formatFloat(fees[0]?.toSignificant() || "")} ${tokenA.symbol}`}
                    </span>
                  </div>
                </RadioButton>
              </div>
            </div>
            {/* Standard B */}
            <div className="flex flex-col rounded-3 bg-tertiary-bg px-5 py-3 mt-4">
              <div className="flex gap-2 items-center mb-3">
                <Image width={32} height={32} src={tokenB.logoURI as any} alt="" />
                <span className="font-bold">{`Standard for collecting ${tokenB.symbol}`}</span>
              </div>
              <div className="flex flex-col gap-2">
                <RadioButton
                  isActive={tokenBStandard === Standard.ERC20}
                  onClick={() => setTokenBStandard(Standard.ERC223)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span>Standard</span>
                      <Badge color="green" text="ERC-20" />
                    </div>
                    <span className="text-16">
                      {`${formatFloat(fees[1]?.toSignificant() || "")} ${tokenB.symbol}`}
                    </span>
                  </div>
                </RadioButton>
                <RadioButton
                  isActive={tokenBStandard === Standard.ERC223}
                  onClick={() => setTokenBStandard(Standard.ERC223)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span>Standard</span>
                      <Badge color="green" text="ERC-223" />
                    </div>
                    <span className="text-16">
                      {`${formatFloat(fees[1]?.toSignificant() || "")} ${tokenB.symbol}`}
                    </span>
                  </div>
                </RadioButton>
              </div>
            </div>
            <div className="text-secondary-text my-4">
              Collecting fees will withdraw currently available fees for you
            </div>

            {[AllowanceStatus.LOADING, AllowanceStatus.PENDING].includes(status) ? (
              <Button fullWidth disabled>
                <span className="flex items-center gap-2">
                  <Preloader size={20} color="black" />
                </span>
              </Button>
            ) : (
              <Button
                onClick={() => {
                  handleCollectFees({ tokensOutCode });
                }}
                fullWidth
              >
                Collect fees
              </Button>
            )}
          </div>
        </DrawerDialog>
      </div>
    </Container>
  );
}
