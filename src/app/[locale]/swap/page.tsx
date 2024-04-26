"use client";
import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Address, formatGwei } from "viem";
import { useAccount, useBalance, useBlockNumber, useGasPrice } from "wagmi";

import useSwap from "@/app/[locale]/swap/hooks/useSwap";
import { useTrade } from "@/app/[locale]/swap/libs/trading";
import { Field, useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import {
  GasOption,
  useSwapGasSettingsStore,
} from "@/app/[locale]/swap/stores/useSwapGasSettingsStore";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import Collapse from "@/components/atoms/Collapse";
import Container from "@/components/atoms/Container";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import Button, { ButtonVariant } from "@/components/buttons/Button";
import IconButton, { IconButtonVariant } from "@/components/buttons/IconButton";
import SwapButton from "@/components/buttons/SwapButton";
import ConfirmSwapDialog from "@/components/dialogs/ConfirmSwapDialog";
import NetworkFeeConfigDialog from "@/components/dialogs/NetworkFeeConfigDialog";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { useConfirmSwapDialogStore } from "@/components/dialogs/stores/useConfirmSwapDialogOpened";
import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import RecentTransactions from "@/components/others/RecentTransactions";
import SelectedTokensInfo from "@/components/others/SelectedTokensInfo";
import TokenInput from "@/components/others/TokenInput";
import { formatFloat } from "@/functions/formatFloat";
import { tryParseCurrencyAmount } from "@/functions/tryParseTick";
import { useRecentTransactionTracking } from "@/hooks/useRecentTransactionTracking";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { CurrencyAmount } from "@/sdk_hybrid/entities/fractions/currencyAmount";
import { Percent } from "@/sdk_hybrid/entities/fractions/percent";
import { Token } from "@/sdk_hybrid/entities/token";
import { GasFeeModel } from "@/stores/useRecentTransactionsStore";
import { useTransactionSettingsStore } from "@/stores/useTransactionSettingsStore";

enum Standard {
  ERC20 = "ERC-20",
  ERC223 = "ERC-223",
}
//sepolia v3 addresses I found
// UniversalRouter: 0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD
// swap router: 0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E
// v3CoreFactoryAddress: 0x0227628f3F023bb0B980b67D528571c95c6DaC1c
// multicallAddress: 0xD7F33bCdb21b359c8ee6F0251d30E94832baAd07
// quoterAddress: 0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3
// v3MigratorAddress: 0x729004182cF005CEC8Bd85df140094b6aCbe8b15
// tickLensAddress: 0xd7f33bcdb21b359c8ee6f0251d30e94832baad07
// WETH: 0xfff9976782d46cc05630d1f6ebab18b2324d6b14
// USD: 0x6f14C02Fc1F78322cFd7d707aB90f18baD3B54f5

function OpenConfirmDialogButton() {
  const { tokenA, tokenB } = useSwapTokensStore();
  const { typedValue } = useSwapAmountsStore();
  const { setIsOpen: setConfirmSwapDialogOpen } = useConfirmSwapDialogStore();

  if (!tokenA || !tokenB) {
    return (
      <Button variant={ButtonVariant.OUTLINED} fullWidth disabled>
        Select tokens
      </Button>
    );
  }

  if (!typedValue) {
    return (
      <Button variant={ButtonVariant.OUTLINED} fullWidth disabled>
        Enter amount
      </Button>
    );
  }

  return (
    <Button onClick={() => setConfirmSwapDialogOpen(true)} fullWidth>
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

const PAGE_SIZE = 10;
export default function SwapPage() {
  useRecentTransactionTracking();

  const t = useTranslations("Trade");

  const [showRecentTransactions, setShowRecentTransactions] = useState(true);

  const [isOpenedFee, setIsOpenedFee] = useState(false);
  const [isOpenedTokenPick, setIsOpenedTokenPick] = useState(false);

  const { setIsOpen } = useTransactionSettingsDialogStore();

  const { slippage, deadline: _deadline } = useTransactionSettingsStore();

  const { address } = useAccount();

  const lang = useLocale();

  const { estimatedGas } = useSwap();

  const {
    tokenA,
    tokenB,
    setTokenA,
    setTokenB,
    tokenAAddress,
    tokenBAddress,
    setTokenAAddress,
    setTokenBAddress,
  } = useSwapTokensStore();

  const [currentlyPicking, setCurrentlyPicking] = useState<"tokenA" | "tokenB">("tokenA");

  const handlePick = useCallback(
    (token: Token) => {
      if (currentlyPicking === "tokenA") {
        setTokenA(token);
        setTokenAAddress(token.address0);
      }

      if (currentlyPicking === "tokenB") {
        setTokenB(token);
        setTokenBAddress(token.address0);
      }

      setIsOpenedTokenPick(false);
    },
    [currentlyPicking, setTokenA, setTokenAAddress, setTokenB, setTokenBAddress],
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
  const { data: tokenA0Balance, refetch: refetchBalanceA0 } = useBalance({
    address: tokenA ? address : undefined,
    token: tokenA ? (tokenA.address0 as Address) : undefined,
  });
  const { data: tokenA1Balance, refetch: refetchBalanceA1 } = useBalance({
    address: tokenA ? address : undefined,
    token: tokenA ? (tokenA.address1 as Address) : undefined,
  });

  const { data: tokenB0Balance, refetch: refetchBalanceB0 } = useBalance({
    address: tokenB ? address : undefined,
    token: tokenB ? (tokenB.address0 as Address) : undefined,
  });
  const { data: tokenB1Balance, refetch: refetchBalanceB1 } = useBalance({
    address: tokenB ? address : undefined,
    token: tokenB ? (tokenB.address1 as Address) : undefined,
  });

  useEffect(() => {
    refetchBalanceA0();
    refetchBalanceA1();
    refetchBalanceB0();
    refetchBalanceB1();
  }, [blockNumber, refetchBalanceA0, refetchBalanceB0, refetchBalanceA1, refetchBalanceB1]);

  const output = useMemo(() => {
    if (!trade) {
      return "";
    }

    return (+trade.outputAmount.toSignificant() * (100 - slippage)) / 100;
  }, [slippage, trade]);

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

  return (
    <>
      <Container>
        <div className={clsx("grid py-[80px]", showRecentTransactions ? "grid-cols-2" : "")}>
          <RecentTransactions
            showRecentTransactions={showRecentTransactions}
            handleClose={() => setShowRecentTransactions(false)}
          />
          <div className="flex justify-center">
            <div className="grid gap-5 w-[640px]">
              <div className="px-10 pt-2.5 pb-5 bg-primary-bg rounded-5">
                <div className="flex justify-between items-center mb-2.5">
                  <h3 className="font-bold text-20">Swap</h3>
                  <div className="flex items-center">
                    <IconButton
                      iconName="recent-transactions"
                      onClick={() => setShowRecentTransactions(!showRecentTransactions)}
                    />
                    <IconButton iconName="gas-edit" onClick={() => setIsOpenedFee(true)} />
                    <IconButton iconSize={24} iconName="settings" onClick={() => setIsOpen(true)} />
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
                  balance0={tokenA0Balance ? formatFloat(tokenA0Balance.formatted) : "0.0"}
                  balance1={tokenA1Balance ? formatFloat(tokenA1Balance.formatted) : "0.0"}
                  label="You pay"
                  standard={
                    Boolean(tokenAAddress) && tokenAAddress === tokenA?.address1
                      ? Standard.ERC223
                      : Standard.ERC20
                  }
                  setStandard={(standard) => {
                    if (standard === Standard.ERC20) {
                      setTokenAAddress(tokenA?.address0);
                    }
                    if (standard === Standard.ERC223) {
                      setTokenAAddress(tokenA?.address1);
                    }
                  }}
                />
                <div className="relative h-3 z-10">
                  <SwapButton
                    onClick={() => {
                      setTokenB(tokenA);
                      setTokenA(tokenB);
                      setTypedValue({
                        typedValue: dependentAmount?.toSignificant() || "",
                        field: Field.CURRENCY_A,
                      });
                    }}
                  />
                </div>
                <TokenInput
                  value={dependentAmount?.toSignificant() || ""}
                  onInputChange={(value) => null}
                  handleClick={() => {
                    setCurrentlyPicking("tokenB");
                    setIsOpenedTokenPick(true);
                  }}
                  token={tokenB}
                  balance0={tokenB0Balance ? formatFloat(tokenB0Balance.formatted) : "0.0"}
                  balance1={tokenB1Balance ? formatFloat(tokenB1Balance.formatted) : "0.0"}
                  label="You receive"
                  standard={
                    Boolean(tokenBAddress) && tokenBAddress === tokenB?.address1
                      ? Standard.ERC223
                      : Standard.ERC20
                  }
                  setStandard={(standard) => {
                    if (standard === Standard.ERC20) {
                      setTokenBAddress(tokenB?.address0);
                    }
                    if (standard === Standard.ERC223) {
                      setTokenBAddress(tokenB?.address1);
                    }
                  }}
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

                <OpenConfirmDialogButton />

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
        <ConfirmSwapDialog />
      </Container>
    </>
  );
}
