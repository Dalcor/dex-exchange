"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";

import FeeAmountSettings from "@/app/[locale]/add/[[...currency]]/components/FeeAmountSettings";
import { useAddLiquidityTokensStore } from "@/app/[locale]/add/[[...currency]]/stores/useAddLiquidityTokensStore";
import { useLiquidityTierStore } from "@/app/[locale]/add/[[...currency]]/stores/useLiquidityTierStore";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import SelectButton from "@/components/atoms/SelectButton";
import SystemIconButton from "@/components/buttons/SystemIconButton";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import SelectedTokensInfo from "@/components/others/SelectedTokensInfo";
import { FEE_TIERS } from "@/config/constants/liquidityFee";
import useAllowance from "@/hooks/useAllowance";
import useDeposit from "@/hooks/useDeposit";
import { useTokens } from "@/hooks/useTokenLists";
import { useRouter } from "@/navigation";
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/sdk_hybrid/addresses";
import { DexChainId } from "@/sdk_hybrid/chains";
import { Token } from "@/sdk_hybrid/entities/token";
import { useRecentTransactionTracking } from "@/stores/useRecentTransactionTracking";

import { DepositAmounts } from "./components/DepositAmounts/DepositAmounts";
import { PoolsRecentTransactions } from "./components/PoolsRecentTransactions";
import { PriceRange } from "./components/PriceRange/PriceRange";
import { useAddLiquidity, useV3DerivedMintInfo } from "./hooks/useAddLiquidity";
import { usePriceRange } from "./hooks/usePrice";
import { Field, useTokensStandards } from "./stores/useAddLiquidityAmountsStore";

export default function AddPoolPage({
  params,
}: {
  params: {
    currency: [string, string, string];
  };
}) {
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

  useEffect(() => {
    if (currency?.[0]) {
      const token = tokens.find((t) => t.address0 === currency[0]);
      if (token) {
        setTokenA(token);
      }
    }

    if (currency?.[1]) {
      const token = tokens.find((t) => t.address0 === currency[1]);
      if (token) {
        setTokenB(token);
      }
    }

    if (currency?.[2]) {
      if (FEE_TIERS.includes(Number(currency[2]))) {
        setTier(Number(currency[2]));
      }
    }
  }, [currency, setTier, setTokenA, setTokenB, tokens]);

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
    isApproving: isApprovingA,
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
    isApproving: isApprovingB,
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

  const { tokenAStandard, tokenBStandard } = useTokensStandards();

  const { handleAddLiquidity } = useAddLiquidity();

  return (
    <Container>
      <div className="w-[1200px] mx-auto my-[80px]">
        <div className="flex justify-between items-center rounded-t-2 border py-2.5 px-6 border-secondary-border">
          <SystemIconButton
            iconSize={32}
            iconName="back"
            size="large"
            onClick={() => router.push("/pools")}
          />
          <h2 className="text-20 font-bold">Add Liquidity</h2>
          <div className="flex">
            <SystemIconButton
              iconSize={24}
              size="large"
              iconName="recent-transactions"
              onClick={() => setShowRecentTransactions(!showRecentTransactions)}
            />
            <SystemIconButton
              iconSize={24}
              size="large"
              iconName="settings"
              onClick={() => setIsOpen(true)}
            />
          </div>
        </div>
        <div className="rounded-3 rounded-t-0 p-10 bg-primary-bg mb-5">
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
                <span>Select token</span>
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
                <span>Select token</span>
              )}
            </SelectButton>
          </div>
          <FeeAmountSettings />
          <div className="grid gap-5 grid-cols-2">
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

          <div className="grid gap-2 mb-5 grid-cols-2 mt-5">
            {tokenAStandard === "ERC-20" ? (
              <>
                {!isAllowedA && (
                  <Button variant="outline" fullWidth onClick={() => approveA()}>
                    {isApprovingA ? "Loading..." : <span>Approve {tokenA?.symbol}</span>}
                  </Button>
                )}
              </>
            ) : (
              <>
                {!isDepositedA && (
                  <Button variant="outline" fullWidth onClick={() => depositA()}>
                    {isDepositingA ? "Loading..." : <span>Deposit {tokenA?.symbol}</span>}
                  </Button>
                )}
              </>
            )}
            {tokenBStandard === "ERC-20" ? (
              <>
                {!isAllowedB && (
                  <Button variant="outline" fullWidth onClick={() => approveB()}>
                    {isApprovingB ? "Loading..." : <span>Approve {tokenB?.symbol}</span>}
                  </Button>
                )}
              </>
            ) : (
              <>
                {!isDepositedB && (
                  <Button variant="outline" fullWidth onClick={() => depositB()}>
                    {isDepositingB ? "Loading..." : <span>Deposit {tokenB?.symbol}</span>}
                  </Button>
                )}
              </>
            )}
          </div>
          {noLiquidity ? (
            <Button
              onClick={() => handleAddLiquidity({ position, increase: false, createPool: true })}
              fullWidth
            >
              Create Pool & Mint liquidity
            </Button>
          ) : (
            <Button onClick={() => handleAddLiquidity({ position, increase: false })} fullWidth>
              Mint liquidity
            </Button>
          )}
        </div>
        <PickTokenDialog
          handlePick={handlePick}
          isOpen={isOpenedTokenPick}
          setIsOpen={setIsOpenedTokenPick}
        />
        <SelectedTokensInfo tokenA={tokenA} tokenB={tokenB} />
        <PoolsRecentTransactions
          isOpen={showRecentTransactions}
          onClose={() => {
            setShowRecentTransactions(false);
          }}
        />
      </div>
    </Container>
  );
}
