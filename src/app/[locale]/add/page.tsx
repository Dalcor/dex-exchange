"use client";

import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useCallback, useState } from "react";

import FeeAmountSettings from "@/app/[locale]/add/components/FeeAmountSettings";
import { useAddLiquidityTokensStore } from "@/app/[locale]/add/stores/useAddLiquidityTokensStore";
import { useLiquidityTierStore } from "@/app/[locale]/add/stores/useLiquidityTierStore";
import Container from "@/components/atoms/Container";
import SelectButton from "@/components/atoms/SelectButton";
import IconButton, {
  IconButtonSize,
  IconButtonVariant,
  IconSize,
} from "@/components/buttons/IconButton";
import RecentTransactions from "@/components/common/RecentTransactions";
import SelectedTokensInfo from "@/components/common/SelectedTokensInfo";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import { usePoolsSearchParams } from "@/hooks/usePoolsSearchParams";
import { useRecentTransactionTracking } from "@/hooks/useRecentTransactionTracking";
import { useRouter } from "@/navigation";
import { Token } from "@/sdk_hybrid/entities/token";

import { DepositAmounts } from "./components/DepositAmounts/DepositAmounts";
import { LiquidityActionButton } from "./components/LiquidityActionButton/LiquidityActionButton";
import { PriceRange } from "./components/PriceRange/PriceRange";
import { usePriceRange } from "./hooks/usePrice";
import { useV3DerivedMintInfo } from "./hooks/useV3DerivedMintInfo";
import { useLiquidityPriceRangeStore } from "./stores/useLiquidityPriceRangeStore";

export default function AddPoolPage() {
  usePoolsSearchParams();
  useRecentTransactionTracking();
  const [isOpenedTokenPick, setIsOpenedTokenPick] = useState(false);
  const [showRecentTransactions, setShowRecentTransactions] = useState(true);
  const t = useTranslations("Liquidity");

  const router = useRouter();

  const { tokenA, tokenB, setTokenA, setTokenB } = useAddLiquidityTokensStore();
  const { tier } = useLiquidityTierStore();
  const { setIsOpen } = useTransactionSettingsDialogStore();

  const [currentlyPicking, setCurrentlyPicking] = useState<"tokenA" | "tokenB">("tokenA");

  const handlePick = useCallback(
    (token: Token) => {
      if (currentlyPicking === "tokenA") {
        if (token === tokenB) {
          setTokenB(tokenA);
        }

        setTokenA(token);
      }

      if (currentlyPicking === "tokenB") {
        if (token === tokenA) {
          setTokenA(tokenB);
        }
        setTokenB(token);
      }

      setIsOpenedTokenPick(false);
    },
    [currentlyPicking, setTokenA, setTokenB, tokenA, tokenB],
  );

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
  const { parsedAmounts, currencies, noLiquidity, outOfRange, depositADisabled, depositBDisabled } =
    useV3DerivedMintInfo({
      tokenA,
      tokenB,
      tier,
      price,
    });

  // Deposit Amounts END

  const isFormDisabled = !tokenA || !tokenB;

  // User need to provide values to price range & Starting price on pool creating
  const { ticks } = useLiquidityPriceRangeStore();
  const { LOWER: tickLower, UPPER: tickUpper } = ticks;
  const isCreatePoolFormFilled =
    !!price && typeof tickLower === "number" && typeof tickUpper === "number";

  return (
    <Container>
      <div className="md:w-[1200px] mx-auto my-4 md:my-[40px]">
        <div className="flex justify-between items-center bg-primary-bg rounded-t-5 py-2.5 px-6">
          <div className="w-[80px] md:w-[104px]">
            <IconButton
              variant={IconButtonVariant.DEFAULT}
              iconSize={IconSize.REGULAR}
              iconName="back"
              buttonSize={IconButtonSize.LARGE}
              onClick={() => router.push("/pools")}
            />
          </div>
          <h2 className="text-18 md:text-20 font-bold">{t("add_liquidity_title")}</h2>
          <div className="w-[80px] md:w-[104px] flex items-center gap-2 justify-end">
            <IconButton
              variant={IconButtonVariant.DEFAULT}
              buttonSize={IconButtonSize.LARGE}
              iconName="recent-transactions"
              active={showRecentTransactions}
              onClick={() => setShowRecentTransactions(!showRecentTransactions)}
            />
            {/* <IconButton
              variant={IconButtonVariant.DEFAULT}
              buttonSize={IconButtonSize.LARGE}
              iconName="settings"
              onClick={() => setIsOpen(true)}
            /> */}
          </div>
        </div>
        <div className="rounded-b-5 border-t-0 p-4 md:p-10 bg-primary-bg mb-4 md:mb-5">
          <h3 className="text-16 font-bold mb-4">{t("select_pair")}</h3>
          <div className="flex gap-3 mb-4 md:mb-5">
            <SelectButton
              variant="rounded-secondary"
              fullWidth
              onClick={() => {
                setCurrentlyPicking("tokenA");
                setIsOpenedTokenPick(true);
              }}
              size="large"
            >
              {tokenA ? (
                <span className="flex gap-2 items-center">
                  <Image
                    className="flex-shrink-0 hidden md:block"
                    src={tokenA?.logoURI || ""}
                    alt="Ethereum"
                    width={32}
                    height={32}
                  />
                  <Image
                    className="flex-shrink-0 block md:hidden"
                    src={tokenA?.logoURI || ""}
                    alt="Ethereum"
                    width={24}
                    height={24}
                  />
                  <span className="block overflow-ellipsis whitespace-nowrap w-[84px] md:w-[141px] overflow-hidden text-left">
                    {tokenA.symbol}
                  </span>
                </span>
              ) : (
                <span className="text-tertiary-text">{t("select_token")}</span>
              )}
            </SelectButton>
            <SelectButton
              variant="rounded-secondary"
              fullWidth
              onClick={() => {
                setCurrentlyPicking("tokenB");
                setIsOpenedTokenPick(true);
              }}
              size="large"
            >
              {tokenB ? (
                <span className="flex gap-2 items-center">
                  <Image
                    className="flex-shrink-0 hidden md:block"
                    src={tokenB?.logoURI || ""}
                    alt="Ethereum"
                    width={32}
                    height={32}
                  />
                  <Image
                    className="flex-shrink-0 block md:hidden"
                    src={tokenB?.logoURI || ""}
                    alt="Ethereum"
                    width={24}
                    height={24}
                  />
                  <span className="block overflow-ellipsis whitespace-nowrap w-[84px] md:w-[141px] overflow-hidden text-left">
                    {tokenB.symbol}
                  </span>
                </span>
              ) : (
                <span className="text-tertiary-text">{t("select_token")}</span>
              )}
            </SelectButton>
          </div>
          <FeeAmountSettings />
          <div className="gap-5 md:grid md:grid-cols-2 mb-5">
            <DepositAmounts
              parsedAmounts={parsedAmounts}
              currencies={currencies}
              depositADisabled={depositADisabled}
              depositBDisabled={depositBDisabled}
              isFormDisabled={isFormDisabled || !isCreatePoolFormFilled}
            />
            <PriceRange
              noLiquidity={noLiquidity}
              formattedPrice={formattedPrice}
              invertPrice={invertPrice}
              isFullRange={isFullRange}
              isSorted={isSorted}
              leftPrice={leftPrice}
              price={price}
              pricesAtTicks={pricesAtTicks}
              rightPrice={rightPrice}
              tickSpaceLimits={tickSpaceLimits}
              ticksAtLimit={ticksAtLimit}
              token0={token0}
              token1={token1}
              outOfRange={outOfRange}
              isFormDisabled={isFormDisabled}
            />
          </div>
          <LiquidityActionButton />
        </div>
        <div className="flex flex-col gap-5">
          <SelectedTokensInfo tokenA={tokenA} tokenB={tokenB} />
          <RecentTransactions
            showRecentTransactions={showRecentTransactions}
            handleClose={() => setShowRecentTransactions(false)}
            pageSize={5}
          />
        </div>
      </div>

      <PickTokenDialog
        handlePick={handlePick}
        isOpen={isOpenedTokenPick}
        setIsOpen={setIsOpenedTokenPick}
      />
    </Container>
  );
}
