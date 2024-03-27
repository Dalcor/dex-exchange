"use client";

import JSBI from "jsbi";
import Image from "next/image";
import { ChangeEvent, useMemo, useState } from "react";

import PositionLiquidityCard from "@/app/[locale]/pool/[tokenId]/components/PositionLiquidityCard";
import useRemoveLiquidity from "@/app/[locale]/remove/[tokenId]/hooks/useRemoveLiquidity";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Svg from "@/components/atoms/Svg";
import Switch from "@/components/atoms/Switch";
import Badge from "@/components/badges/Badge";
import RangeBadge from "@/components/badges/RangeBadge";
import InputButton from "@/components/buttons/InputButton";
import SystemIconButton from "@/components/buttons/SystemIconButton";
import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import SelectedTokensInfo from "@/components/others/SelectedTokensInfo";
import TokensPair from "@/components/others/TokensPair";
import { WrappedToken } from "@/config/types/WrappedToken";
import {
  usePositionFromPositionInfo,
  usePositionFromTokenId,
  usePositionRangeStatus,
} from "@/hooks/usePositions";
import { useRouter } from "@/navigation";
import { Percent } from "@/sdk/entities/fractions/percent";
import { useRecentTransactionTracking } from "@/stores/useRecentTransactionTracking";
export default function DecreaseLiquidityPage({
  params,
}: {
  params: {
    tokenId: string;
  };
}) {
  useRecentTransactionTracking();

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
  const { setIsOpen } = useTransactionSettingsDialogStore();

  const { handleRemoveLiquidity } = useRemoveLiquidity({ percentage: value });

  return (
    <Container>
      <div className="w-[600px] bg-primary-bg mx-auto mt-[80px] mb-5 px-10 pb-10">
        <div className="grid grid-cols-3 py-1.5 -mx-3">
          <SystemIconButton
            onClick={() => router.push(`/pool/${params.tokenId}`)}
            size="large"
            iconName="back"
            iconSize={32}
          />
          <h2 className="text-20 font-bold flex justify-center items-center">Remove liquidity</h2>
          <div className="flex items-center gap-2 justify-end">
            <SystemIconButton
              onClick={() => setIsOpen(true)}
              size="large"
              iconName="recent-transactions"
              iconSize={24}
            />
            <SystemIconButton
              onClick={() => setIsOpen(true)}
              size="large"
              iconName="settings"
              iconSize={24}
            />
          </div>
        </div>
        <div className="rounded-b-2 bg-primary-bg">
          <div className="flex items-center justify-between mb-5">
            <TokensPair tokenA={tokenA} tokenB={tokenB} />
            <RangeBadge status={removed ? "closed" : inRange ? "in-range" : "out-of-range"} />
          </div>

          <div className="mb-5">
            <h4 className="mb-2">Amount</h4>
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
          <div className="mb-5 flex items-center justify-between">
            Collect as WMATIC
            <Switch checked={false} setChecked={null} />
          </div>
          {position && tokenA && tokenB && (
            <Button onClick={() => handleRemoveLiquidity(tokenA, tokenB, position)} fullWidth>
              Remove liquidity
            </Button>
          )}
        </div>
      </div>
      <div className="w-[600px] mx-auto mb-[80px]">
        <SelectedTokensInfo tokenA={tokenA} tokenB={tokenB} />
      </div>
    </Container>
  );
}
