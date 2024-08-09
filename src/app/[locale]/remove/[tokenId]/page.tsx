"use client";

import JSBI from "jsbi";
import Image from "next/image";
import { ChangeEvent, useMemo, useState } from "react";

import useRemoveLiquidity from "@/app/[locale]/remove/[tokenId]/hooks/useRemoveLiquidity";
import Alert from "@/components/atoms/Alert";
import Container from "@/components/atoms/Container";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import RangeBadge, { PositionRangeStatus } from "@/components/badges/RangeBadge";
import Button from "@/components/buttons/Button";
import IconButton, { IconButtonSize, IconSize } from "@/components/buttons/IconButton";
import InputButton from "@/components/buttons/InputButton";
import RecentTransactions from "@/components/common/RecentTransactions";
import SelectedTokensInfo from "@/components/common/SelectedTokensInfo";
import TokensPair from "@/components/common/TokensPair";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import { AllowanceStatus } from "@/hooks/useAllowance";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import {
  usePositionFromPositionInfo,
  usePositionFromTokenId,
  usePositionRangeStatus,
} from "@/hooks/usePositions";
import { useRecentTransactionTracking } from "@/hooks/useRecentTransactionTracking";
import { Link, useRouter } from "@/navigation";
import { Percent } from "@/sdk_hybrid/entities/fractions/percent";
import { Token } from "@/sdk_hybrid/entities/token";

import PositionLiquidityCard from "../../pool/[tokenId]/components/PositionLiquidityCard";

const RemoveLiquidityRow = ({ token, amount }: { token: Token | undefined; amount: string }) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span>{`Pooled ${token?.symbol}:`}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-bold">{amount}</span>
        <Image src={token?.logoURI || ""} alt={token?.symbol || ""} width={24} height={24} />
      </div>
    </div>
  );
};

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
  const chainId = useCurrentChainId();
  const [value, setValue] = useState(25);
  const [tokenA, tokenB, fee] = useMemo(() => {
    return position?.pool.token0 && position?.pool.token1 && position?.pool.fee
      ? [position.pool.token0, position.pool.token1, position.pool.fee]
      : [undefined, undefined];
  }, [position?.pool.fee, position?.pool.token0, position?.pool.token1]);

  const { inRange, removed } = usePositionRangeStatus({ position });
  const [showRecentTransactions, setShowRecentTransactions] = useState(true);

  const { handleRemoveLiquidity, status, removeLiquidityHash, resetRemoveLiquidity } =
    useRemoveLiquidity({
      percentage: value,
      tokenId: params.tokenId,
    });

  const handleClose = () => {
    resetRemoveLiquidity();
    setIsOpen(false);
  };

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
              onClick={() => setShowRecentTransactions(!showRecentTransactions)}
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
              />
              <PositionLiquidityCard
                token={tokenB}
                amount={
                  position?.amount1
                    .multiply(new Percent(value))
                    .divide(JSBI.BigInt(100))
                    .toSignificant() || "Loading..."
                }
              />
            </div>
          </div>
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
      <DrawerDialog
        isOpen={isOpen}
        setIsOpen={(isOpen) => {
          if (isOpen) {
            setIsOpen(isOpen);
          } else {
            handleClose();
          }
        }}
      >
        <DialogHeader onClose={handleClose} title="Confirm removing liquidity" />
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
              {removeLiquidityHash && (
                <a
                  target="_blank"
                  href={getExplorerLink(ExplorerLinkType.TRANSACTION, removeLiquidityHash, chainId)}
                >
                  <IconButton iconName="forward" />
                </a>
              )}

              {status === AllowanceStatus.PENDING && (
                <>
                  <Preloader type="linear" />
                  <span className="text-secondary-text text-14">Proceed in your wallet</span>
                </>
              )}
              {status === AllowanceStatus.LOADING && <Preloader size={24} />}
              {status === AllowanceStatus.SUCCESS && (
                <Svg className="text-green" iconName="done" size={24} />
              )}
              {status === AllowanceStatus.ERROR && (
                <Svg className="text-red-input" iconName="warning" size={24} />
              )}
            </div>
          </div>
          <div className="py-5">
            <div className="grid gap-3">
              <RemoveLiquidityRow
                token={tokenA}
                amount={
                  position?.amount0
                    .multiply(new Percent(value))
                    .divide(JSBI.BigInt(100))
                    .toSignificant() || "Loading..."
                }
              />
              <RemoveLiquidityRow
                token={tokenB}
                amount={
                  position?.amount1
                    .multiply(new Percent(value))
                    .divide(JSBI.BigInt(100))
                    .toSignificant() || "Loading..."
                }
              />
            </div>
          </div>

          {[AllowanceStatus.INITIAL].includes(status) ? (
            <Button
              onClick={() => {
                handleRemoveLiquidity(tokenA, tokenB, position);
              }}
              fullWidth
            >
              Confirm removing liquidity
            </Button>
          ) : null}
          {[AllowanceStatus.LOADING, AllowanceStatus.PENDING].includes(status) ? (
            <Button fullWidth disabled>
              <span className="flex items-center gap-2">
                <Preloader size={20} color="black" />
              </span>
            </Button>
          ) : null}

          {[AllowanceStatus.ERROR].includes(status) ? (
            <div className="flex flex-col gap-5">
              <Alert
                withIcon={false}
                type="error"
                text={
                  <span>
                    Transaction failed due to lack of gas or an internal contract error. Try using
                    higher slippage or gas to ensure your transaction is completed. If you still
                    have issues, click{" "}
                    <a href="#" className="text-green hover:underline">
                      common errors
                    </a>
                    .
                  </span>
                }
              />
              <Button
                onClick={() => {
                  handleRemoveLiquidity(tokenA, tokenB, position);
                }}
                fullWidth
              >
                Try again
              </Button>
            </div>
          ) : null}
          {[AllowanceStatus.SUCCESS].includes(status) ? (
            <div className="flex flex-col gap-5">
              <Alert
                withIcon={false}
                type="info"
                text={
                  <span>
                    Tokens have been transferred to your position. You can claim them using the
                    following link:{" "}
                    <Link href={`/pool/${params.tokenId}`}>
                      <span className="text-green hover:underline">claim tokens</span>
                    </Link>
                  </span>
                }
              />
              <Button onClick={handleClose} fullWidth>
                Close
              </Button>
            </div>
          ) : null}
        </div>
      </DrawerDialog>
    </Container>
  );
}
