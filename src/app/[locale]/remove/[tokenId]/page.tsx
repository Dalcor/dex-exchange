"use client";

import JSBI from "jsbi";
import Image from "next/image";
import { ChangeEvent, useMemo, useState } from "react";

import PositionLiquidityCard from "@/app/[locale]/pool/[tokenId]/components/PositionLiquidityCard";
import useRemoveLiquidity from "@/app/[locale]/remove/[tokenId]/hooks/useRemoveLiquidity";
import Container from "@/components/atoms/Container";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Switch from "@/components/atoms/Switch";
import RangeBadge, { PositionRangeStatus } from "@/components/badges/RangeBadge";
import Button from "@/components/buttons/Button";
import IconButton, { IconButtonSize, IconSize } from "@/components/buttons/IconButton";
import InputButton from "@/components/buttons/InputButton";
import RecentTransactions from "@/components/common/RecentTransactions";
import SelectedTokensInfo from "@/components/common/SelectedTokensInfo";
import TokensPair from "@/components/common/TokensPair";
import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import { AllowanceStatus } from "@/hooks/useAllowance";
import {
  usePositionFromPositionInfo,
  usePositionFromTokenId,
  usePositionRangeStatus,
} from "@/hooks/usePositions";
import { useRecentTransactionTracking } from "@/hooks/useRecentTransactionTracking";
import { useRouter } from "@/navigation";
import { Percent } from "@/sdk_hybrid/entities/fractions/percent";

export default function DecreaseLiquidityPage({
  params,
}: {
  params: {
    tokenId: string;
  };
}) {
  useRecentTransactionTracking();

  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { position: positionInfo, loading } = usePositionFromTokenId(BigInt(params.tokenId));
  const position = usePositionFromPositionInfo(positionInfo);
  const [value, setValue] = useState(25);
  const [tokenA, tokenB, fee] = useMemo(() => {
    return position?.pool.token0 && position?.pool.token1 && position?.pool.fee
      ? [position.pool.token0, position.pool.token1, position.pool.fee]
      : [undefined, undefined];
  }, [position?.pool.fee, position?.pool.token0, position?.pool.token1]);

  const { inRange, removed } = usePositionRangeStatus({ position });
  const [showRecentTransactions, setShowRecentTransactions] = useState(true);

  const { handleRemoveLiquidity, status } = useRemoveLiquidity({
    percentage: value,
    tokenId: params.tokenId,
  });

  if (!tokenA || !tokenB) return <div>Error: Token A or B undefined</div>;

  return (
    <Container>
      <div className="w-[600px] bg-primary-bg mx-auto mt-[40px] mb-5 px-10 pb-10 rounded-5">
        <div className="grid grid-cols-3 py-1.5 -mx-3">
          <IconButton
            onClick={() => router.push(`/pool/${params.tokenId}`)}
            buttonSize={IconButtonSize.LARGE}
            iconName="back"
            iconSize={IconSize.LARGE}
          />
          <h2 className="text-20 font-bold flex justify-center items-center">Remove liquidity</h2>
          <div className="flex items-center gap-2 justify-end">
            <IconButton
              onClick={() => setShowRecentTransactions(true)}
              buttonSize={IconButtonSize.LARGE}
              iconName="recent-transactions"
              active={showRecentTransactions}
            />
            {/* <IconButton
              onClick={() => setIsOpen(true)}
              buttonSize={IconButtonSize.LARGE}
              iconName="settings"
            /> */}
          </div>
        </div>
        <div className="rounded-b-2 bg-primary-bg">
          <div className="flex items-center justify-between mb-5">
            <TokensPair tokenA={tokenA} tokenB={tokenB} />
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

          <div className="mb-5">
            <text className="mb-2 text-secondary-text">Amount</text>
            <div className="flex justify-between items-center mb-4">
              <span className="text-32">{value}%</span>
              <div className="flex gap-3">
                <InputButton text={"25%"} isActive={value === 25} onClick={() => setValue(25)} />
                <InputButton text={"50%"} isActive={value === 50} onClick={() => setValue(50)} />
                <InputButton text={"75%"} isActive={value === 75} onClick={() => setValue(75)} />
                <InputButton text={"MAX"} isActive={value === 100} onClick={() => setValue(100)} />
              </div>
            </div>

            <div className="relative h-6">
              <input
                value={value}
                max={100}
                min={1}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(+e.target.value)}
                className="w-full accent-green absolute top-2 left-0 right-0 duration-200"
                type="range"
              />
              <div
                className="pointer-events-none absolute bg-green h-2 rounded-1 left-0 top-2"
                style={{ width: value === 1 ? 0 : `calc(${value}% - 2px)` }}
              ></div>
            </div>
          </div>

          <div className="border border-secondary-border rounded-3 bg-tertiary-bg mb-5 p-5">
            <div className="grid gap-3">
              <PositionLiquidityCard
                token={tokenA}
                amount={
                  position?.amount0
                    .multiply(new Percent(value))
                    .divide(JSBI.BigInt(100))
                    .toSignificant() || "Loading..."
                }
                standards={["ERC-20", "ERC-223"]}
              />
              <PositionLiquidityCard
                token={tokenB}
                amount={
                  position?.amount1
                    .multiply(new Percent(value))
                    .divide(JSBI.BigInt(100))
                    .toSignificant() || "Loading..."
                }
                standards={["ERC-20", "ERC-223"]}
              />
            </div>
          </div>
          {/* <div className="mb-5 flex items-center justify-between">
            Collect as WMATIC
            <Switch checked={false} handleChange={() => null} />
          </div> */}
          {position && tokenA && tokenB && (
            <Button onClick={() => setIsOpen(true)} fullWidth>
              Remove
            </Button>
          )}
        </div>
      </div>
      <div className="w-[600px] mx-auto mb-[40px] gap-5 flex flex-col">
        <SelectedTokensInfo tokenA={tokenA} tokenB={tokenB} />
        <RecentTransactions
          showRecentTransactions={showRecentTransactions}
          handleClose={() => setShowRecentTransactions(false)}
          pageSize={5}
        />
      </div>
      <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
        <DialogHeader onClose={() => setIsOpen(false)} title="Confirm removing liquidity" />
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
          <div className="border border-secondary-border rounded-3 bg-tertiary-bg my-5 p-5">
            <div className="grid gap-3">
              <PositionLiquidityCard
                token={tokenA}
                amount={
                  position?.amount0
                    .multiply(new Percent(value))
                    .divide(JSBI.BigInt(100))
                    .toSignificant() || "Loading..."
                }
                standards={["ERC-20", "ERC-223"]}
              />
              <PositionLiquidityCard
                token={tokenB}
                amount={
                  position?.amount1
                    .multiply(new Percent(value))
                    .divide(JSBI.BigInt(100))
                    .toSignificant() || "Loading..."
                }
                standards={["ERC-20", "ERC-223"]}
              />
            </div>
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
                handleRemoveLiquidity(tokenA, tokenB, position);
              }}
              fullWidth
            >
              Confirm removing liquidity
            </Button>
          )}
        </div>
      </DrawerDialog>
    </Container>
  );
}
