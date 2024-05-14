"use client";

import clsx from "clsx";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";

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
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import RecentTransactions from "@/components/others/RecentTransactions";
import SelectedTokensInfo from "@/components/others/SelectedTokensInfo";
import useAllowance from "@/hooks/useAllowance";
import useDeposit from "@/hooks/useDeposit";
import { usePoolsSearchParams } from "@/hooks/usePoolsSearchParams";
import { useRecentTransactionTracking } from "@/hooks/useRecentTransactionTracking";
import { useTokens } from "@/hooks/useTokenLists";
import { useRouter } from "@/navigation";
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/sdk_hybrid/addresses";
import { DexChainId } from "@/sdk_hybrid/chains";
import { Token } from "@/sdk_hybrid/entities/token";

import { ApproveButton } from "./components/ApproveButton";
import { DepositAmounts } from "./components/DepositAmounts/DepositAmounts";
import { MintButton } from "./components/MintButton";
import { PriceRange } from "./components/PriceRange/PriceRange";
import { useAddLiquidity, useV3DerivedMintInfo } from "./hooks/useAddLiquidity";
import { useLiquidityApprove } from "./hooks/useLiquidityApprove";
import { usePriceRange } from "./hooks/usePrice";
import { Field, useTokensStandards } from "./stores/useAddLiquidityAmountsStore";

export default function AddPoolPage({
  params,
}: {
  params: {
    currency: [string, string, string];
  };
}) {
  usePoolsSearchParams();
  useRecentTransactionTracking();
  const [isOpenedTokenPick, setIsOpenedTokenPick] = useState(false);
  const [showRecentTransactions, setShowRecentTransactions] = useState(true);
  const { chainId } = useAccount();

  const router = useRouter();

  const currency = params.currency;

  const { tokenA, tokenB, setTokenA, setTokenB } = useAddLiquidityTokensStore();
  const { tier, setTier } = useLiquidityTierStore();
  const { setIsOpen } = useTransactionSettingsDialogStore();

  const tokens = useTokens();

  const [currentlyPicking, setCurrentlyPicking] = useState<"tokenA" | "tokenB">("tokenA");

  const handlePick = useCallback(
    (token: Token) => {
      if (currentlyPicking === "tokenA") {
        setTokenA(token);
      }

      if (currentlyPicking === "tokenB") {
        setTokenB(token);
      }

      setIsOpenedTokenPick(false);
    },
    [currentlyPicking, setTokenA, setTokenB],
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
    writeTokenRevoke: revokeA,
    isPending: isPendingA,
    isLoading: isLoadingA,
    currentAllowance: currentAllowanceA,
    isRevoking: isRevokingA,
  } = useAllowance({
    token: tokenA,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
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
    isPending: isPendingB,
    isLoading: isLoadingB,
    currentAllowance: currentAllowanceB,
    isRevoking: isRevokingB,
  } = useAllowance({
    token: tokenB,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
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
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
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
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
    // TODO: mb better way to convert CurrencyAmount to bigint
    amountToCheck: parseUnits(
      parsedAmounts[Field.CURRENCY_B]?.toSignificant() || "",
      tokenB?.decimals || 18,
    ),
  });

  // Deposit Amounts END
  const { approveTransactions, handleApprove, approveTransactionsType, gasPrice } =
    useLiquidityApprove();

  const isFormDisabled = !tokenA || !tokenB;

  return (
    <Container>
      <div className="w-[1200px] mx-auto my-[80px]">
        <div className="grid grid-cols-3 bg-primary-bg rounded-t-5 py-2.5 px-6">
          <IconButton
            variant={IconButtonVariant.DEFAULT}
            iconSize={IconSize.REGULAR}
            iconName="back"
            buttonSize={IconButtonSize.LARGE}
            onClick={() => router.push("/pools")}
          />
          <h2 className="text-20 font-bold justify-center flex items-center">Add Liquidity</h2>
          <div className="flex items-center gap-2 justify-end">
            <IconButton
              variant={IconButtonVariant.DEFAULT}
              buttonSize={IconButtonSize.LARGE}
              iconName="recent-transactions"
              onClick={() => setShowRecentTransactions(!showRecentTransactions)}
            />
            <IconButton
              variant={IconButtonVariant.DEFAULT}
              buttonSize={IconButtonSize.LARGE}
              iconName="settings"
              onClick={() => setIsOpen(true)}
            />
          </div>
        </div>
        <div className="rounded-b-5 border-t-0 p-10 bg-primary-bg mb-5">
          <h3 className="text-16 font-bold mb-4">Select pair</h3>
          <div className="flex gap-3 mb-5">
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
                    className="flex-shrink-0"
                    src={tokenA?.logoURI || ""}
                    alt="Ethereum"
                    width={32}
                    height={32}
                  />
                  <span className="block overflow-ellipsis whitespace-nowrap w-[141px] overflow-hidden text-left">
                    {tokenA.symbol}
                  </span>
                </span>
              ) : (
                <span className="text-tertiary-text">Select token</span>
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
                    className="flex-shrink-0"
                    src={tokenB?.logoURI || ""}
                    alt="Ethereum"
                    width={32}
                    height={32}
                  />
                  <span className="block overflow-ellipsis whitespace-nowrap w-[141px] overflow-hidden text-left">
                    {tokenB.symbol}
                  </span>
                </span>
              ) : (
                <span className="text-tertiary-text">Select token</span>
              )}
            </SelectButton>
          </div>
          <FeeAmountSettings isDisabled={isFormDisabled} />
          <div className={clsx("grid gap-5 grid-cols-2", isFormDisabled && "opacity-20")}>
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
              approveTransactions={approveTransactions}
              gasPrice={gasPrice}
              isFormDisabled={isFormDisabled}
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
            />
          </div>
          {approveTransactions?.length ? (
            <ApproveButton
              approveTransactions={approveTransactions}
              handleApprove={handleApprove}
              approveTransactionsType={approveTransactionsType}
              gasPrice={gasPrice}
            />
          ) : (
            <MintButton />
          )}
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
