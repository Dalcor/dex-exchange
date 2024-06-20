"use client";
import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useMemo } from "react";
import { formatGwei } from "viem";
import { useGasPrice } from "wagmi";

import ConfirmSwapDialog from "@/app/[locale]/swap/components/ConfirmSwapDialog";
import TradeForm from "@/app/[locale]/swap/components/TradeForm";
import TwoVersionsInfo from "@/app/[locale]/swap/components/TwoVersionsInfo";
import { useSwapEstimatedGas } from "@/app/[locale]/swap/hooks/useSwap";
import { useTrade } from "@/app/[locale]/swap/libs/trading";
import { Field, useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import { useSwapGasSettingsStore } from "@/app/[locale]/swap/stores/useSwapGasSettingsStore";
import { useSwapRecentTransactionsStore } from "@/app/[locale]/swap/stores/useSwapRecentTransactions";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import Container from "@/components/atoms/Container";
import Svg from "@/components/atoms/Svg";
import Badge from "@/components/badges/Badge";
import RecentTransactions from "@/components/common/RecentTransactions";
import SelectedTokensInfo from "@/components/common/SelectedTokensInfo";
import { formatFloat } from "@/functions/formatFloat";
import { tryParseCurrencyAmount } from "@/functions/tryParseTick";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useRecentTransactionTracking } from "@/hooks/useRecentTransactionTracking";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { CurrencyAmount } from "@/sdk_hybrid/entities/fractions/currencyAmount";
import { GasFeeModel } from "@/stores/useRecentTransactionsStore";

enum Standard {
  ERC20 = "ERC-20",
  ERC223 = "ERC-223",
}

export default function SwapPage() {
  useRecentTransactionTracking();
  useSwapEstimatedGas();

  const { isOpened: showRecentTransactions, setIsOpened: setShowRecentTransactions } =
    useSwapRecentTransactionsStore();

  const chainId = useCurrentChainId();

  const { tokenA, tokenB, reset: resetTokens } = useSwapTokensStore();

  const { reset: resetAmount } = useSwapAmountsStore();

  useEffect(() => {
    resetTokens();
    resetAmount();
  }, [chainId, resetAmount, resetTokens]);

  return (
    <>
      <Container>
        <div
          className={clsx(
            "grid py-4 lg:py-[40px] grid-cols-1 mx-auto",
            showRecentTransactions
              ? "xl:grid-cols-[580px_600px] xl:max-w-[1200px] gap-4 xl:grid-areas-[left_right] grid-areas-[right,left]"
              : "xl:grid-cols-[600px] xl:max-w-[600px] grid-areas-[right]",
          )}
        >
          {showRecentTransactions && (
            <div className="grid-in-[left] flex justify-center">
              <div className="w-full sm:max-w-[600px] xl:max-w-full">
                <RecentTransactions
                  showRecentTransactions={showRecentTransactions}
                  handleClose={() => setShowRecentTransactions(false)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-center grid-in-[right]">
            <div className="flex flex-col gap-5 w-full sm:max-w-[600px] xl:max-w-full">
              <TwoVersionsInfo />
              <a
                target="_blank"
                href="https://gorbatiukcom.github.io/token-converter/"
                className="flex items-center gap-1 pl-4 pr-5 justify-between rounded-2 bg-primary-bg border-l-4 border-l-green py-3 hover:bg-green-bg duration-200"
              >
                <div className="flex items-center gap-1">
                  <Svg iconName="convert" className="text-green mr-1 flex-shrink-0" />
                  Convert your <Badge text="ERC-20" /> tokens to <Badge text="ERC-223" />
                </div>
                <Svg className="text-primary-text" iconName="forward" />
              </a>
              <TradeForm />
              <SelectedTokensInfo tokenA={tokenA} tokenB={tokenB} />
            </div>
          </div>
        </div>

        <ConfirmSwapDialog />
      </Container>
    </>
  );
}
