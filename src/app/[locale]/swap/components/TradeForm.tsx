import clsx from "clsx";
import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Address, formatGwei, parseUnits } from "viem";
import { useAccount, useBalance, useBlockNumber, useGasPrice } from "wagmi";

import SwapDetails from "@/app/[locale]/swap/components/SwapDetails";
import useSwap, { useSwapStatus } from "@/app/[locale]/swap/hooks/useSwap";
import { useTrade } from "@/app/[locale]/swap/libs/trading";
import { useConfirmSwapDialogStore } from "@/app/[locale]/swap/stores/useConfirmSwapDialogOpened";
import { Field, useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import {
  GasOption,
  useSwapGasSettingsStore,
} from "@/app/[locale]/swap/stores/useSwapGasSettingsStore";
import { useSwapRecentTransactionsStore } from "@/app/[locale]/swap/stores/useSwapRecentTransactions";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import Preloader from "@/components/atoms/Preloader";
import Tooltip from "@/components/atoms/Tooltip";
import Button, { ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import IconButton from "@/components/buttons/IconButton";
import SwapButton from "@/components/buttons/SwapButton";
import TokenInput, { Standard } from "@/components/common/TokenInput";
import NetworkFeeConfigDialog from "@/components/dialogs/NetworkFeeConfigDialog";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { useConnectWalletDialogStateStore } from "@/components/dialogs/stores/useConnectWalletStore";
import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import { networks } from "@/config/networks";
import { formatFloat } from "@/functions/formatFloat";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { CurrencyAmount } from "@/sdk_hybrid/entities/fractions/currencyAmount";
import { Token } from "@/sdk_hybrid/entities/token";
import { GasFeeModel } from "@/stores/useRecentTransactionsStore";

function OpenConfirmDialogButton({
  isSufficientBalance,
  isTradeReady,
  isTradeLoading,
}: {
  isSufficientBalance: boolean;
  isTradeReady: boolean;
  isTradeLoading: boolean;
}) {
  const tWallet = useTranslations("Wallet");
  const t = useTranslations("Swap");
  const { isConnected } = useAccount();

  const { tokenA, tokenB } = useSwapTokensStore();
  const { typedValue } = useSwapAmountsStore();
  const { setIsOpen: setConfirmSwapDialogOpen } = useConfirmSwapDialogStore();

  const { isLoadingSwap, isLoadingApprove, isPendingApprove, isPendingSwap } = useSwapStatus();
  const { setIsOpened: setWalletConnectOpened } = useConnectWalletDialogStateStore();

  if (!isConnected) {
    return (
      <Button onClick={() => setWalletConnectOpened(true)} fullWidth>
        {tWallet("connect_wallet")}
      </Button>
    );
  }

  if (isLoadingSwap) {
    return (
      <Button fullWidth disabled>
        <span className="flex items-center gap-2">
          <span>{t("processing_swap")}</span>
          <Preloader size={20} color="black" />
        </span>
      </Button>
    );
  }

  if (isLoadingApprove) {
    return (
      <Button fullWidth disabled>
        <span className="flex items-center gap-2">
          <span>{t("approving_in_progress")}</span>
          <Preloader size={20} color="black" />
        </span>
      </Button>
    );
  }

  if (isPendingApprove || isPendingSwap) {
    return (
      <Button fullWidth disabled>
        <span className="flex items-center gap-2">
          <span>{t("waiting_for_confirmation")}</span>
          <Preloader size={20} color="black" />
        </span>
      </Button>
    );
  }

  if (!tokenA || !tokenB) {
    return (
      <Button variant={ButtonVariant.OUTLINED} fullWidth disabled>
        {t("select_tokens")}
      </Button>
    );
  }

  if (!typedValue) {
    return (
      <Button variant={ButtonVariant.OUTLINED} fullWidth disabled>
        {t("enter_amount")}
      </Button>
    );
  }

  if (isTradeLoading) {
    return (
      <Button variant={ButtonVariant.OUTLINED} fullWidth disabled>
        {t("looking_for_the_best_trade")}
      </Button>
    );
  }

  if (!isTradeReady) {
    return (
      <Button variant={ButtonVariant.OUTLINED} fullWidth disabled>
        {t("swap_is_unavailable_for_this_pair")}
      </Button>
    );
  }

  if (!isSufficientBalance) {
    return (
      <Button variant={ButtonVariant.OUTLINED} fullWidth disabled>
        {t("insufficient_balance")}
      </Button>
    );
  }

  return (
    <Button onClick={() => setConfirmSwapDialogOpen(true)} fullWidth>
      {t("swap")}
    </Button>
  );
}

const gasOptionTitle: Record<GasOption, any> = {
  [GasOption.CHEAP]: "cheap",
  [GasOption.FAST]: "fast",
  [GasOption.CUSTOM]: "custom",
};
export default function TradeForm() {
  const t = useTranslations("Swap");

  const { address } = useAccount();
  const chainId = useCurrentChainId();
  const [isOpenedFee, setIsOpenedFee] = useState(false);
  const { isOpened: showRecentTransactions, setIsOpened: setShowRecentTransactions } =
    useSwapRecentTransactionsStore();
  const { setIsOpen } = useTransactionSettingsDialogStore();
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

  const { setTypedValue, independentField, dependentField, typedValue } = useSwapAmountsStore();

  const { trade, isLoading: isLoadingTrade } = useTrade();
  const dependentAmount: CurrencyAmount<Currency> | undefined = useMemo(() => {
    return trade?.outputAmount;
  }, [trade?.outputAmount]);

  const [isOpenedTokenPick, setIsOpenedTokenPick] = useState(false);

  const handlePick = useCallback(
    (token: Token) => {
      if (currentlyPicking === "tokenA") {
        if (token === tokenB) {
          setTokenB(tokenA);
          setTokenBAddress(tokenAAddress);
        }

        setTokenA(token);
        setTokenAAddress(token.address0);
      }

      if (currentlyPicking === "tokenB") {
        if (token === tokenA) {
          setTokenA(tokenB);
          setTokenAAddress(tokenBAddress);
        }
        setTokenB(token);
        setTokenBAddress(token.address0);
      }

      setIsOpenedTokenPick(false);
    },
    [
      currentlyPicking,
      setTokenA,
      setTokenAAddress,
      setTokenB,
      setTokenBAddress,
      tokenA,
      tokenAAddress,
      tokenB,
      tokenBAddress,
    ],
  );

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

  const { data: blockNumber } = useBlockNumber({ watch: true });

  useEffect(() => {
    refetchBalanceA0();
    refetchBalanceA1();
    refetchBalanceB0();
    refetchBalanceB1();
  }, [blockNumber, refetchBalanceA0, refetchBalanceB0, refetchBalanceA1, refetchBalanceB1]);

  const { gasOption, gasPrice, gasLimit } = useSwapGasSettingsStore();

  const { isLoadingSwap, isPendingSwap, isLoadingApprove, isPendingApprove } = useSwapStatus();

  const { setIsOpen: setConfirmSwapDialogOpen } = useConfirmSwapDialogStore();

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

    return "0.00";
  }, [baseFee, gasPrice]);

  return (
    <div className="px-4 md:px-10 pt-2.5 pb-5 bg-primary-bg rounded-5">
      <div className="flex justify-between items-center mb-2.5">
        <h3 className="font-bold text-20">{t("swap")}</h3>
        <div className="flex items-center">
          <IconButton
            active={showRecentTransactions}
            iconName="recent-transactions"
            onClick={() => setShowRecentTransactions(!showRecentTransactions)}
          />
          <IconButton disabled iconName="gas-edit" onClick={() => setIsOpenedFee(true)} />
          <IconButton iconSize={24} iconName="settings" onClick={() => setIsOpen(true)} />
        </div>
      </div>
      <TokenInput
        value={typedValue}
        onInputChange={(value) => setTypedValue({ typedValue: value, field: Field.CURRENCY_A })}
        handleClick={() => {
          setCurrentlyPicking("tokenA");
          setIsOpenedTokenPick(true);
        }}
        token={tokenA}
        balance0={tokenA0Balance ? formatFloat(tokenA0Balance.formatted) : "0.0"}
        balance1={tokenA1Balance ? formatFloat(tokenA1Balance.formatted) : "0.0"}
        label={t("you_pay")}
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
            setTokenAAddress(tokenBAddress);
            setTokenBAddress(tokenAAddress);
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
        label={t("you_receive")}
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
          "rounded-3 py-3.5 flex flex-col md:flex-row justify-between duration-200 px-5 bg-tertiary-bg my-5 md:items-center",
        )}
        // role="button"
      >
        <div className="flex items-center gap-1">
          <Tooltip
            text={t("network_fee_tooltip", {
              networkName: networks.find((n) => n.chainId === chainId)?.name,
            })}
          />
          <div className="text-secondary-text text-14 flex items-center">{t("network_fee")}</div>
        </div>

        <div className="flex items-center gap-2 justify-between md:justify-end">
          <span className="flex gap-2 items-center">
            <span className="flex items-center justify-center px-2 text-14 rounded-20 font-500 text-secondary-text bg-quaternary-bg">
              {t(gasOptionTitle[gasOption])}
            </span>
            <div>
              <span className="text-secondary-text mr-1 text-14">{computedGasSpending} GWEI</span>{" "}
              <span className="mr-1 text-14">~$0.00</span>
            </div>
          </span>

          <button
            disabled //TODO: Remove disabled
            className="border border-green flex px-4 rounded-5 opacity-50"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpenedFee(true);
            }}
          >
            {t("edit")}
          </button>
        </div>
      </div>

      {(isLoadingSwap || isPendingSwap || isPendingApprove || isLoadingApprove) && (
        <div className="flex justify-between px-5 py-3 rounded-2 bg-tertiary-bg mb-5">
          <div className="flex items-center gap-2 text-14">
            <Preloader size={20} />

            {isLoadingSwap && <span>{t("processing_swap")}</span>}
            {isPendingSwap && <span>{t("waiting_for_confirmation")}</span>}
            {isLoadingApprove && <span>{t("approving_in_progress")}</span>}
            {isPendingApprove && <span>{t("waiting_for_confirmation")}</span>}
          </div>

          <Button
            onClick={() => {
              setConfirmSwapDialogOpen(true);
            }}
            size={ButtonSize.EXTRA_SMALL}
          >
            {t("review_swap")}
          </Button>
        </div>
      )}

      <OpenConfirmDialogButton
        isSufficientBalance={
          (tokenAAddress === tokenA?.address0 &&
            (tokenA0Balance && tokenA
              ? tokenA0Balance?.value >= parseUnits(typedValue, tokenA.decimals)
              : false)) ||
          (tokenAAddress === tokenA?.address1 &&
            (tokenA1Balance && tokenA
              ? tokenA1Balance?.value >= parseUnits(typedValue, tokenA.decimals)
              : false))
        }
        isTradeReady={Boolean(trade)}
        isTradeLoading={isLoadingTrade}
      />

      {trade && tokenA && tokenB && <SwapDetails trade={trade} tokenA={tokenA} tokenB={tokenB} />}

      <NetworkFeeConfigDialog isOpen={isOpenedFee} setIsOpen={setIsOpenedFee} />
      <PickTokenDialog
        handlePick={handlePick}
        isOpen={isOpenedTokenPick}
        setIsOpen={setIsOpenedTokenPick}
      />
    </div>
  );
}
