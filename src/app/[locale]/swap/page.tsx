"use client";
import clsx from "clsx";
import React, { useEffect } from "react";

import ConfirmSwapDialog from "@/app/[locale]/swap/components/ConfirmSwapDialog";
import ExternalConverterLink from "@/app/[locale]/swap/components/ExternalConverterLink";
import TradeForm from "@/app/[locale]/swap/components/TradeForm";
import TwoVersionsInfo from "@/app/[locale]/swap/components/TwoVersionsInfo";
import { useSwapEstimatedGas } from "@/app/[locale]/swap/hooks/useSwap";
import { useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import { useSwapRecentTransactionsStore } from "@/app/[locale]/swap/stores/useSwapRecentTransactions";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import Container from "@/components/atoms/Container";
import RecentTransactions from "@/components/common/RecentTransactions";
import SelectedTokensInfo from "@/components/common/SelectedTokensInfo";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useRecentTransactionTracking } from "@/hooks/useRecentTransactionTracking";
import { useSwapSearchParams } from "@/hooks/useSwapSearchParams";

export default function SwapPage() {
  useSwapSearchParams();
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
              <ExternalConverterLink />
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
