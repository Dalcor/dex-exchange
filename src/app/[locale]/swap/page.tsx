"use client";
import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useMemo } from "react";
import { formatGwei } from "viem";
import { useGasPrice } from "wagmi";

import ConfirmSwapDialog from "@/app/[locale]/swap/components/ConfirmSwapDialog";
import TradeForm from "@/app/[locale]/swap/components/TradeForm";
import TwoVersionsInfo from "@/app/[locale]/swap/components/TwoVersionsInfo";
import { useTrade } from "@/app/[locale]/swap/libs/trading";
import { Field, useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import { useSwapGasSettingsStore } from "@/app/[locale]/swap/stores/useSwapGasSettingsStore";
import { useSwapRecentTransactionsStore } from "@/app/[locale]/swap/stores/useSwapRecentTransactions";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import Container from "@/components/atoms/Container";
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

  const t = useTranslations("Trade");

  const { isOpened: showRecentTransactions, setIsOpened: setShowRecentTransactions } =
    useSwapRecentTransactionsStore();

  const lang = useLocale();
  const chainId = useCurrentChainId();

  const { tokenA, tokenB, reset } = useSwapTokensStore();

  useEffect(() => {
    reset();
  }, [chainId, reset]);

  const { trade, isLoading: isLoadingTrade } = useTrade();

  const { setTypedValue, independentField, dependentField, typedValue } = useSwapAmountsStore();

  const currencies = {
    [Field.CURRENCY_A]: tokenA,
    [Field.CURRENCY_B]: tokenB,
  };

  // amounts
  const independentAmount: CurrencyAmount<Currency> | undefined = tryParseCurrencyAmount(
    typedValue,
    currencies[independentField],
  );

  return (
    <>
      <Container>
        <div
          className={clsx(
            "grid py-4 lg:py-[80px] grid-cols-1 mx-auto",
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
