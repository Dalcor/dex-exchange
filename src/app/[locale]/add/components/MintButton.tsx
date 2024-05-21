import clsx from "clsx";
import Image from "next/image";
import { useEffect, useState } from "react";
import { formatEther, formatGwei } from "viem";
import { useAccount, useBlock, useGasPrice } from "wagmi";

import PositionPriceRangeCard from "@/app/[locale]/pool/[tokenId]/components/PositionPriceRangeCard";
import Dialog from "@/components/atoms/Dialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Badge from "@/components/badges/Badge";
import RangeBadge, { PositionRangeStatus } from "@/components/badges/RangeBadge";
import Button from "@/components/buttons/Button";
import { FEE_AMOUNT_DETAIL } from "@/config/constants/liquidityFee";
import { formatFloat } from "@/functions/formatFloat";
import { AllowanceStatus } from "@/hooks/useAllowance";
import { usePositionPrices, usePositionRangeStatus } from "@/hooks/usePositions";

import { useAddLiquidity, useV3DerivedMintInfo } from "../hooks/useAddLiquidity";
import { usePriceRange } from "../hooks/usePrice";
import { Field, useTokensStandards } from "../stores/useAddLiquidityAmountsStore";
import { useAddLiquidityTokensStore } from "../stores/useAddLiquidityTokensStore";
import { useLiquidityTierStore } from "../stores/useLiquidityTierStore";

export const MintButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { chainId, chain } = useAccount();
  const { tokenA, tokenB, setTokenA, setTokenB } = useAddLiquidityTokensStore();
  const { tier, setTier } = useLiquidityTierStore();
  const { price } = usePriceRange();
  const { tokenAStandard, tokenBStandard } = useTokensStandards();
  const [showFirst, setShowFirst] = useState(true);

  const { handleAddLiquidity, estimatedGas, status } = useAddLiquidity();

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

  // Gas price
  const { data: gasPrice, refetch: refetchGasPrice } = useGasPrice();
  const { data: block } = useBlock({ watch: true, blockTag: "latest" });

  useEffect(() => {
    refetchGasPrice();
  }, [block, refetchGasPrice]);

  const buttonText = noLiquidity ? "Create Pool & Mint liquidity" : "Mint liquidity";
  const { inRange, removed } = usePositionRangeStatus({ position });

  const { minPriceString, maxPriceString, currentPriceString, ratio } = usePositionPrices({
    position,
    showFirst,
  });

  if (!tokenA || !tokenB || !position) return null;
  return (
    <div className="my-5">
      <Button onClick={() => setIsOpen(true)} fullWidth>
        {buttonText}
      </Button>
      <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
        <DialogHeader onClose={() => setIsOpen(false)} title="Add liquidity" />
        <div className="px-4 md:px-10 md:w-[570px] pb-4 md:pb-10">
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
              <span className="text-18 font-bold">{`${tokenA.symbol} / ${tokenB.symbol}`}</span>
              <RangeBadge
                status={inRange ? PositionRangeStatus.IN_RANGE : PositionRangeStatus.OUT_OF_RANGE}
              />
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

          {/* Amounts */}

          <div className="flex flex-col rounded-3 bg-tertiary-bg p-5 mt-4">
            <div className="flex gap-3">
              <div className="flex flex-col items-center w-full rounded-3 bg-quaternary-bg px-5 py-3">
                <div className="flex items-center gap-2">
                  <Image width={24} height={24} src={tokenA.logoURI as any} alt="" />
                  <span>{tokenA.symbol}</span>
                  <Badge color="green" text={tokenAStandard} />
                </div>
                <span className="text-16 font-medium">
                  {formatFloat(parsedAmounts[Field.CURRENCY_A]?.toSignificant() || "")}
                </span>
              </div>
              <div className="flex flex-col items-center w-full rounded-3 bg-quaternary-bg px-5 py-3">
                <div className="flex items-center gap-2">
                  <Image width={24} height={24} src={tokenB.logoURI as any} alt="" />
                  <span>{tokenB.symbol}</span>
                  <Badge color="green" text={tokenBStandard} />
                </div>
                <span className="text-16 font-medium">
                  {formatFloat(parsedAmounts[Field.CURRENCY_B]?.toSignificant() || "")}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="font-bold">Fee Tier</span>
              <span>{`${FEE_AMOUNT_DETAIL[tier].label}%`}</span>
            </div>
          </div>
          {/* Price range */}
          <div>
            <div className="flex justify-between items-center mb-3 mt-5">
              <span className="font-bold text-secondary-text">Selected Range</span>
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
            <div className="grid grid-cols-[1fr_20px_1fr] mb-3">
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

          {/* GAS */}
          <div className="flex justify-between bg-tertiary-bg px-5 py-3 rounded-3 mb-5 mt-5">
            <div className="flex flex-col">
              <span className="text-14 text-secondary-text">Gas price</span>
              <span>{gasPrice ? formatFloat(formatGwei(gasPrice)) : ""} GWEI</span>
            </div>
            <div className="flex flex-col">
              <span className="text-14 text-secondary-text">Gas limit</span>
              <span>{estimatedGas?.toString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-14 text-secondary-text">Fee</span>
              <span>{`${gasPrice && estimatedGas ? formatFloat(formatEther(gasPrice * estimatedGas)) : "0"} ${chain?.nativeCurrency.symbol}`}</span>
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
                handleAddLiquidity({
                  position,
                  increase: false,
                  createPool: noLiquidity ? true : false,
                });
              }}
              fullWidth
            >
              {buttonText}
            </Button>
          )}
        </div>
      </DrawerDialog>
    </div>
  );
};
