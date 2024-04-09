"use client";
import clsx from "clsx";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Address, formatGwei, parseUnits } from "viem";
import { useAccount, useBalance, useBlockNumber, useGasPrice } from "wagmi";

import useSwap from "@/app/[locale]/swap/hooks/useSwap";
import useSwapGas from "@/app/[locale]/swap/hooks/useSwapGas";
import { useTrade } from "@/app/[locale]/swap/libs/trading";
import { Field, useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import {
  GasOption,
  useSwapGasSettingsStore,
} from "@/app/[locale]/swap/stores/useSwapGasSettingsStore";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import Button from "@/components/atoms/Button";
import Collapse from "@/components/atoms/Collapse";
import Container from "@/components/atoms/Container";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import SystemIconButton from "@/components/buttons/SystemIconButton";
import NetworkFeeConfigDialog from "@/components/dialogs/NetworkFeeConfigDialog";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import Pagination from "@/components/others/Pagination";
import RecentTransaction from "@/components/others/RecentTransaction";
import SelectedTokensInfo from "@/components/others/SelectedTokensInfo";
import TokenInput from "@/components/others/TokenInput";
import { WrappedToken } from "@/config/types/WrappedToken";
import { formatFloat } from "@/functions/formatFloat";
import { tryParseCurrencyAmount } from "@/functions/tryParseTick";
import useAllowance from "@/hooks/useAllowance";
import useTransactionDeadline from "@/hooks/useTransactionDeadline";
import { ROUTER_ADDRESS } from "@/sdk/addresses";
import { DexChainId } from "@/sdk/chains";
import { Currency } from "@/sdk/entities/currency";
import { CurrencyAmount } from "@/sdk/entities/fractions/currencyAmount";
import { Percent } from "@/sdk/entities/fractions/percent";
import { GasFeeModel, useRecentTransactionsStore } from "@/stores/useRecentTransactionsStore";
import { useRecentTransactionTracking } from "@/stores/useRecentTransactionTracking";
import { useTransactionSettingsStore } from "@/stores/useTransactionSettingsStore";

//sepolia v3 addresses I found
// UniversalRouter: 0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD
// swap router: 0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E
// v3CoreFactoryAddress: 0x0227628f3F023bb0B980b67D528571c95c6DaC1c
// multicallAddress: 0xD7F33bCdb21b359c8ee6F0251d30E94832baAd07
// quoterAddress: 0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3
// v3MigratorAddress: 0x729004182cF005CEC8Bd85df140094b6aCbe8b15
// nonfungiblePositionManagerAddress: 0x1238536071E1c677A632429e3655c799b22cDA52
// tickLensAddress: 0xd7f33bcdb21b359c8ee6f0251d30e94832baad07
// WETH: 0xfff9976782d46cc05630d1f6ebab18b2324d6b14
// USD: 0x6f14C02Fc1F78322cFd7d707aB90f18baD3B54f5

function SwapActionButton() {
  const { tokenA, tokenB } = useSwapTokensStore();
  const { typedValue } = useSwapAmountsStore();

  const { handleSwap } = useSwap();
  const { chainId } = useAccount();

  const {
    isAllowed: isAllowedA,
    writeTokenApprove: approveA,
    isApproving: isApprovingA,
  } = useAllowance({
    token: tokenA,
    contractAddress: ROUTER_ADDRESS[chainId as DexChainId],
    amountToCheck: parseUnits(typedValue, tokenA?.decimals || 18),
  });

  if (!tokenA || !tokenB) {
    return (
      <Button variant="outline" fullWidth disabled>
        Select tokens
      </Button>
    );
  }

  if (!typedValue) {
    return (
      <Button variant="outline" fullWidth disabled>
        Enter amount
      </Button>
    );
  }

  if (!isAllowedA) {
    return (
      <Button fullWidth variant="outline" onClick={() => approveA()}>
        {isApprovingA ? "Loading..." : <span>Approve {tokenA?.symbol}</span>}
      </Button>
    );
  }

  return (
    <Button onClick={handleSwap} fullWidth>
      Swap
    </Button>
  );
}

function SwapDetailsRow({
  title,
  value,
  tooltipText,
}: {
  title: string;
  value: string;
  tooltipText: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-2 items-center text-secondary-text">
        <Tooltip iconSize={20} text={tooltipText} />
        {title}
      </div>
      <span>{value}</span>
    </div>
  );
}

const gasOptionTitle: Record<GasOption, string> = {
  [GasOption.CHEAP]: "Cheap",
  [GasOption.FAST]: "Fast",
  [GasOption.CUSTOM]: "Custom",
};

const PAGE_SIZE = 1;
export default function SwapPage() {
  useRecentTransactionTracking();

  const t = useTranslations("Trade");

  const [showRecentTransactions, setShowRecentTransactions] = useState(true);

  const [isOpenedFee, setIsOpenedFee] = useState(false);
  const [isOpenedTokenPick, setIsOpenedTokenPick] = useState(false);

  const { setIsOpen } = useTransactionSettingsDialogStore();

  const { slippage, deadline: _deadline } = useTransactionSettingsStore();
  const deadline = useTransactionDeadline(_deadline);

  const { address } = useAccount();

  const lang = useLocale();

  const { estimatedGas } = useSwap();

  const { tokenA, tokenB, setTokenA, setTokenB } = useSwapTokensStore();

  const [currentlyPicking, setCurrentlyPicking] = useState<"tokenA" | "tokenB">("tokenA");

  const handlePick = useCallback(
    (token: WrappedToken) => {
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

  const { trade } = useTrade();

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

  const dependentAmount: CurrencyAmount<Currency> | undefined = useMemo(() => {
    return trade?.outputAmount;
  }, [trade?.outputAmount]);

  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { data: tokenABalance, refetch: refetchBalanceA } = useBalance({
    address: tokenA ? address : undefined,
    token: tokenA ? (tokenA.address as Address) : undefined,
  });

  const { data: tokenBBalance, refetch: refetchBalanceB } = useBalance({
    address: tokenB ? address : undefined,
    token: tokenB ? (tokenB.address as Address) : undefined,
  });

  useEffect(() => {
    refetchBalanceA();
    refetchBalanceB();
  }, [blockNumber, refetchBalanceA, refetchBalanceB]);

  const output = useMemo(() => {
    if (!trade) {
      return "";
    }

    return (+trade.outputAmount.toSignificant() * (100 - slippage)) / 100;
  }, [slippage, trade]);

  const { transactions } = useRecentTransactionsStore();

  const _transactions = useMemo(() => {
    if (address && transactions[address]) {
      return transactions[address];
    }

    return [];
  }, [address, transactions]);

  const [effect, setEffect] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const { gasOption, gasPrice, gasLimit } = useSwapGasSettingsStore();
  const { data: baseFee } = useGasPrice();

  const computedGasSpending = useMemo(() => {
    if (gasPrice.model === GasFeeModel.LEGACY && gasPrice.gasPrice) {
      return formatFloat(formatGwei(gasPrice.gasPrice));
    }

    if (
      gasPrice.model === GasFeeModel.EIP1559 &&
      gasPrice.maxFeePerGas &&
      gasPrice.maxPriorityFeePerGas &&
      baseFee
    ) {
      const lowerFeePerGas = gasPrice.maxFeePerGas > baseFee ? baseFee : gasPrice.maxFeePerGas;

      return formatFloat(formatGwei(lowerFeePerGas + gasPrice.maxPriorityFeePerGas));
    }

    return "Loading...";
  }, [baseFee, gasPrice]);

  const [currentPage, setCurrentPage] = useState(1);

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PAGE_SIZE;
    const lastPageIndex = firstPageIndex + PAGE_SIZE;
    return _transactions.slice(firstPageIndex, lastPageIndex);
  }, [_transactions, currentPage]);

  return (
    <>
      <Container>
        <div className={clsx("grid py-[80px]", showRecentTransactions ? "grid-cols-2" : "")}>
          {showRecentTransactions && (
            <div>
              <div className="px-10 pt-2.5 bg-primary-bg rounded-5">
                <div className="flex justify-between items-center mb-2.5">
                  <h3 className="font-bold text-20">Transactions</h3>
                  <div className="flex items-center">
                    <SystemIconButton
                      iconSize={24}
                      iconName="close"
                      onClick={() => setShowRecentTransactions(false)}
                    />
                  </div>
                </div>
                <div>
                  {currentTableData.length ? (
                    <>
                      <div className="pb-10 flex flex-col gap-1">
                        {currentTableData.map((transaction) => {
                          return (
                            <RecentTransaction transaction={transaction} key={transaction.hash} />
                          );
                        })}
                      </div>
                      <Pagination
                        className="pagination-bar"
                        currentPage={currentPage}
                        totalCount={_transactions.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={(page) => setCurrentPage(page as number)}
                      />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[324px] gap-2">
                      <Image src="/empty/empty-history.svg" width={80} height={80} alt="" />
                      <span className="text-secondary-text">
                        All transaction will be displayed here.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-center">
            <div className="grid gap-5 w-[640px]">
              <div className="px-10 pt-2.5 pb-5 bg-primary-bg rounded-5">
                <div className="flex justify-between items-center mb-2.5">
                  <h3 className="font-bold text-20">Swap</h3>
                  <div className="flex items-center">
                    <SystemIconButton
                      iconSize={24}
                      iconName="recent-transactions"
                      onClick={() => setShowRecentTransactions(!showRecentTransactions)}
                    />
                    <SystemIconButton
                      iconSize={24}
                      iconName="gas-edit"
                      onClick={() => setIsOpenedFee(true)}
                    />
                    <SystemIconButton
                      iconSize={24}
                      iconName="settings"
                      onClick={() => setIsOpen(true)}
                    />
                  </div>
                </div>
                <TokenInput
                  value={typedValue}
                  onInputChange={(value) =>
                    setTypedValue({ typedValue: value, field: Field.CURRENCY_A })
                  }
                  handleClick={() => {
                    setCurrentlyPicking("tokenA");
                    setIsOpenedTokenPick(true);
                  }}
                  token={tokenA}
                  balance={tokenABalance ? formatFloat(tokenABalance.formatted) : "0.0"}
                  label="You pay"
                />
                <div className="relative h-3 z-10">
                  <button
                    onClick={() => {
                      setEffect(true);
                      setTokenB(tokenA);
                      setTokenA(tokenB);
                      setTypedValue({
                        typedValue: dependentAmount?.toSignificant() || "",
                        field: Field.CURRENCY_A,
                      });
                    }}
                    className="border-[3px] text-green border-tertiary-bg outline outline-tertiary-bg  w-10 h-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-secondary-bg rounded-full flex items-center justify-center duration-200 hover:outline-green hover:shadow-checkbox"
                  >
                    <Svg
                      className={effect ? "animate-swap" : ""}
                      onAnimationEnd={() => setEffect(false)}
                      iconName="swap"
                    />
                  </button>
                </div>
                <TokenInput
                  value={dependentAmount?.toSignificant() || ""}
                  onInputChange={(value) => null}
                  handleClick={() => {
                    setCurrentlyPicking("tokenB");
                    setIsOpenedTokenPick(true);
                  }}
                  token={tokenB}
                  balance={tokenBBalance ? formatFloat(tokenBBalance.formatted) : "0.0"}
                  label="You receive"
                />

                <div
                  className={clsx(
                    "rounded-3 h-12 flex justify-between duration-200 px-5 bg-tertiary-bg my-5 items-center",
                  )}
                  role="button"
                >
                  <div className="flex items-center gap-1">
                    <Tooltip text="Tooltip" />
                    <div className="text-secondary-text text-14 flex items-center">Network fee</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center px-2 text-14 rounded-20 font-500 text-secondary-text bg-quaternary-bg">
                      {gasOptionTitle[gasOption]}
                    </span>
                    <div>
                      <span className="text-secondary-text mr-1 text-14">
                        {computedGasSpending} GWEI
                      </span>{" "}
                      <span className="mr-1 text-14">~$0.00</span>
                    </div>
                    <button
                      className="border border-green flex px-4 rounded-5"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpenedFee(true);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <SwapActionButton />

                <div
                  className={clsx("mt-5 bg-tertiary-bg", !expanded ? "rounded-3" : "rounded-t-3")}
                >
                  <div
                    className={clsx(
                      "h-12 flex justify-between duration-200 px-5 items-center",
                      !expanded ? "hover:bg-green-bg rounded-3" : "rounded-t-3",
                    )}
                    role="button"
                    onClick={() => setExpanded(!expanded)}
                  >
                    <div className="text-secondary-text text-14 flex items-center">
                      Swap details
                    </div>
                    <span className="text-secondary-text">
                      <Svg
                        className={clsx("duration-200", expanded && "-rotate-180")}
                        iconName="small-expand-arrow"
                      />
                    </span>
                  </div>
                </div>
                <Collapse open={expanded}>
                  <div className="flex flex-col gap-2 pb-4 px-5 bg-tertiary-bg rounded-b-3 text-14">
                    <SwapDetailsRow
                      title={`${tokenA?.symbol} Price`}
                      value={
                        trade
                          ? `${trade.executionPrice.toSignificant()} ${tokenB?.symbol}`
                          : "Loading..."
                      }
                      tooltipText="Minimum received tooltip"
                    />
                    <SwapDetailsRow
                      title={`${tokenB?.symbol} Price`}
                      value={
                        trade
                          ? `${trade.executionPrice.invert().toSignificant()} ${tokenA?.symbol}`
                          : "Loading..."
                      }
                      tooltipText="Minimum received tooltip"
                    />
                    <SwapDetailsRow
                      title="Min. received"
                      value={
                        trade
                          ?.minimumAmountOut(new Percent(slippage * 100, 10000), dependentAmount)
                          .toSignificant() || "Loading..."
                      }
                      tooltipText="Minimum received tooltip"
                    />
                    <SwapDetailsRow
                      title="Price impact"
                      value={
                        trade ? `${formatFloat(trade.priceImpact.toSignificant())}%` : "Loading..."
                      }
                      tooltipText="Minimum received tooltip"
                    />
                    <SwapDetailsRow
                      title="Trading fee"
                      value="Loading..."
                      tooltipText="Minimum received tooltip"
                    />
                    <SwapDetailsRow
                      title="Order routing"
                      value="Loading..."
                      tooltipText="Minimum received tooltip"
                    />
                    <SwapDetailsRow
                      title="Max. slippage"
                      value={`${slippage}%`}
                      tooltipText="Minimum received tooltip"
                    />
                    <SwapDetailsRow
                      title="Gas limit"
                      value={estimatedGas?.toString() || "Loading..."}
                      tooltipText="Minimum received tooltip"
                    />
                  </div>
                </Collapse>

                <NetworkFeeConfigDialog isOpen={isOpenedFee} setIsOpen={setIsOpenedFee} />
              </div>
              <SelectedTokensInfo tokenA={tokenA} tokenB={tokenB} />
            </div>
          </div>
        </div>

        <PickTokenDialog
          handlePick={handlePick}
          isOpen={isOpenedTokenPick}
          setIsOpen={setIsOpenedTokenPick}
        />
      </Container>
    </>
  );
}
