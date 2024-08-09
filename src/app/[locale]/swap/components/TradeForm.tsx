import clsx from "clsx";
import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { formatGwei, formatUnits, parseUnits } from "viem";
import { useAccount, useGasPrice } from "wagmi";

import SwapDetails from "@/app/[locale]/swap/components/SwapDetails";
import { useSwapStatus } from "@/app/[locale]/swap/hooks/useSwap";
import { useTrade } from "@/app/[locale]/swap/libs/trading";
import { useConfirmSwapDialogStore } from "@/app/[locale]/swap/stores/useConfirmSwapDialogOpened";
import { Field, useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import {
  GasOption,
  useSwapGasPriceStore,
} from "@/app/[locale]/swap/stores/useSwapGasSettingsStore";
import { useSwapRecentTransactionsStore } from "@/app/[locale]/swap/stores/useSwapRecentTransactions";
import { useSwapSettingsStore } from "@/app/[locale]/swap/stores/useSwapSettingsStore";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import Preloader from "@/components/atoms/Preloader";
import Tooltip from "@/components/atoms/Tooltip";
import Button, { ButtonSize } from "@/components/buttons/Button";
import IconButton, { IconButtonSize } from "@/components/buttons/IconButton";
import SwapButton from "@/components/buttons/SwapButton";
import TokenInput from "@/components/common/TokenInput";
import NetworkFeeConfigDialog from "@/components/dialogs/NetworkFeeConfigDialog";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { useConnectWalletDialogStateStore } from "@/components/dialogs/stores/useConnectWalletStore";
import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import { networks } from "@/config/networks";
import { formatFloat } from "@/functions/formatFloat";
import { useStoreAllowance } from "@/hooks/useAllowance";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useFees } from "@/hooks/useFees";
import { usePoolBalances } from "@/hooks/usePoolBalances";
import useScopedBlockNumber from "@/hooks/useScopedBlockNumber";
import useTokenBalances from "@/hooks/useTokenBalances";
import { ROUTER_ADDRESS } from "@/sdk_hybrid/addresses";
import { DexChainId } from "@/sdk_hybrid/chains";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { CurrencyAmount } from "@/sdk_hybrid/entities/fractions/currencyAmount";
import { Token } from "@/sdk_hybrid/entities/token";
import { Standard } from "@/sdk_hybrid/standard";
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
      <Button fullWidth isLoading>
        <span className="flex items-center gap-2">
          <span>{t("processing_swap")}</span>
          <Preloader size={20} color="black" />
        </span>
      </Button>
    );
  }

  if (isLoadingApprove) {
    return (
      <Button fullWidth isLoading>
        <span className="flex items-center gap-2">
          <span>{t("approving_in_progress")}</span>
          <Preloader size={20} color="black" />
        </span>
      </Button>
    );
  }

  if (isPendingApprove || isPendingSwap) {
    return (
      <Button fullWidth isLoading>
        <span className="flex items-center gap-2">
          <span>{t("waiting_for_confirmation")}</span>
          <Preloader size={20} color="black" />
        </span>
      </Button>
    );
  }

  if (!tokenA || !tokenB) {
    return (
      <Button fullWidth disabled>
        {t("select_tokens")}
      </Button>
    );
  }

  if (!typedValue) {
    return (
      <Button fullWidth disabled>
        {t("enter_amount")}
      </Button>
    );
  }

  if (isTradeLoading) {
    return (
      <Button fullWidth disabled>
        {t("looking_for_the_best_trade")}
      </Button>
    );
  }

  if (!isTradeReady) {
    return (
      <Button fullWidth disabled>
        {t("swap_is_unavailable_for_this_pair")}
      </Button>
    );
  }

  if (!isSufficientBalance) {
    return (
      <Button fullWidth disabled>
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
    tokenAStandard,
    tokenBStandard,
    setTokenAStandard,
    setTokenBStandard,
  } = useSwapTokensStore();
  const { computed } = useSwapSettingsStore();

  const [currentlyPicking, setCurrentlyPicking] = useState<"tokenA" | "tokenB">("tokenA");

  const { setTypedValue, independentField, dependentField, typedValue } = useSwapAmountsStore();

  const { isAllowed: isAllowedA } = useStoreAllowance({
    token: tokenA,
    contractAddress: ROUTER_ADDRESS[chainId],
    amountToCheck: parseUnits(typedValue, tokenA?.decimals || 18),
  });

  const { trade, isLoading: isLoadingTrade } = useTrade();

  const { erc20BalanceToken1, erc223BalanceToken1 } = usePoolBalances({
    tokenA,
    tokenB,
  });

  const dependentAmount: CurrencyAmount<Currency> | undefined = useMemo(() => {
    return trade?.outputAmount;
  }, [trade?.outputAmount]);

  const isConvertationRequired = useMemo(() => {
    if (erc20BalanceToken1 && tokenBStandard === Standard.ERC20) {
      if (dependentAmount && +dependentAmount.toSignificant() > +erc20BalanceToken1.formatted) {
        return true;
      }
    }

    if (erc223BalanceToken1 && tokenBStandard === Standard.ERC223) {
      if (dependentAmount && +dependentAmount.toSignificant() > +erc223BalanceToken1.formatted) {
        return true;
      }
    }

    return false;
  }, [dependentAmount, erc20BalanceToken1, erc223BalanceToken1, tokenBStandard]);

  const gasERC20 = useMemo(() => {
    if (!tokenA || !tokenB || !typedValue) {
      return "—";
    }

    let gasForERC20 = 149;

    if (!isAllowedA) {
      gasForERC20 += 29;
    }

    if (isConvertationRequired) {
      gasForERC20 += 56;
    }

    return `~${gasForERC20}K gas`;
  }, [isAllowedA, isConvertationRequired, tokenA, tokenB, typedValue]);

  const gasERC223 = useMemo(() => {
    if (!tokenA || !tokenB || !typedValue) {
      return "—";
    }

    let gasForERC223 = 127;

    if (isConvertationRequired) {
      gasForERC223 += 56;
    }

    return `~${gasForERC223}K gas`;
  }, [isConvertationRequired, tokenA, tokenB, typedValue]);

  const [isOpenedTokenPick, setIsOpenedTokenPick] = useState(false);

  const handlePick = useCallback(
    (token: Token) => {
      if (currentlyPicking === "tokenA") {
        if (token === tokenB) {
          setTokenB(tokenA);
          setTokenBStandard(tokenAStandard);
        }

        setTokenA(token);
        setTokenAStandard(Standard.ERC20);
      }

      if (currentlyPicking === "tokenB") {
        if (token === tokenA) {
          setTokenA(tokenB);
          setTokenAStandard(tokenBStandard);
        }
        setTokenB(token);
        setTokenBStandard(Standard.ERC20);
      }

      setIsOpenedTokenPick(false);
    },
    [
      currentlyPicking,
      setTokenA,
      setTokenAStandard,
      setTokenB,
      setTokenBStandard,
      tokenA,
      tokenAStandard,
      tokenB,
      tokenBStandard,
    ],
  );

  const {
    balance: { erc20Balance: tokenA0Balance, erc223Balance: tokenA1Balance },
    refetch: refetchABalance,
  } = useTokenBalances(tokenA);
  const {
    balance: { erc20Balance: tokenB0Balance, erc223Balance: tokenB1Balance },
    refetch: refetchBBalance,
  } = useTokenBalances(tokenB);

  const { data: blockNumber } = useScopedBlockNumber();

  useEffect(() => {
    refetchABalance();
    refetchBBalance();
  }, [blockNumber, refetchABalance, refetchBBalance]);

  const { gasPriceOption, gasPriceSettings } = useSwapGasPriceStore();

  const { isLoadingSwap, isPendingSwap, isLoadingApprove, isPendingApprove } = useSwapStatus();

  const { setIsOpen: setConfirmSwapDialogOpen } = useConfirmSwapDialogStore();
  const { baseFee } = useFees();

  const computedGasSpending = useMemo(() => {
    if (gasPriceSettings.model === GasFeeModel.LEGACY && gasPriceSettings.gasPrice) {
      return formatFloat(formatGwei(gasPriceSettings.gasPrice));
    }

    if (
      gasPriceSettings.model === GasFeeModel.EIP1559 &&
      gasPriceSettings.maxFeePerGas &&
      gasPriceSettings.maxPriorityFeePerGas &&
      baseFee
    ) {
      const lowerFeePerGas =
        gasPriceSettings.maxFeePerGas > baseFee ? baseFee : gasPriceSettings.maxFeePerGas;

      return formatFloat(formatGwei(lowerFeePerGas + gasPriceSettings.maxPriorityFeePerGas));
    }

    return undefined;
  }, [baseFee, gasPriceSettings]);

  return (
    <div className="px-4 md:px-10 pt-2.5 pb-5 bg-primary-bg rounded-5">
      <div className="flex justify-between items-center mb-2.5">
        <h3 className="font-bold text-20">{t("swap")}</h3>
        <div className="flex items-center">
          <IconButton
            buttonSize={IconButtonSize.LARGE}
            active={showRecentTransactions}
            iconName="recent-transactions"
            onClick={() => setShowRecentTransactions(!showRecentTransactions)}
          />
          <IconButton
            buttonSize={IconButtonSize.LARGE}
            // disabled
            iconName="gas-edit"
            onClick={() => setIsOpenedFee(true)}
          />

          <span className="relative">
            <IconButton
              buttonSize={IconButtonSize.LARGE}
              iconSize={24}
              iconName="settings"
              onClick={() => setIsOpen(true)}
            />
            {computed.isModified && (
              <div className="absolute w-2 h-2 right-[13px] top-[13px] bg-primary-bg flex items-center justify-center rounded-full">
                <div className="w-1 h-1 bg-red-input rounded-full" />
              </div>
            )}
          </span>
        </div>
      </div>
      <TokenInput
        value={typedValue}
        onInputChange={(value) => setTypedValue({ typedValue: value, field: Field.CURRENCY_A })}
        handleClick={() => {
          setCurrentlyPicking("tokenA");
          setIsOpenedTokenPick(true);
        }}
        gasERC20={gasERC20}
        gasERC223={gasERC223}
        token={tokenA}
        balance0={tokenA0Balance ? formatFloat(tokenA0Balance.formatted) : "0.0"}
        balance1={tokenA1Balance ? formatFloat(tokenA1Balance.formatted) : "0.0"}
        setMax={
          (Boolean(tokenA0Balance?.value) && tokenAStandard === Standard.ERC20) ||
          (Boolean(tokenA1Balance?.value) && tokenAStandard === Standard.ERC223)
            ? () => {
                if (tokenA0Balance && tokenAStandard === Standard.ERC20) {
                  setTypedValue({
                    typedValue: tokenA0Balance.formatted,

                    field: Field.CURRENCY_A,
                  });
                }
                if (tokenA1Balance && tokenAStandard === Standard.ERC223) {
                  setTypedValue({
                    typedValue: tokenA1Balance.formatted,

                    field: Field.CURRENCY_A,
                  });
                }
              }
            : undefined
        }
        setHalf={
          (Boolean(tokenA0Balance?.value) && tokenAStandard === Standard.ERC20) ||
          (Boolean(tokenA1Balance?.value) && tokenAStandard === Standard.ERC223)
            ? () => {
                if (tokenA0Balance && tokenAStandard === Standard.ERC20) {
                  setTypedValue({
                    typedValue: formatUnits(
                      tokenA0Balance.value / BigInt(2),
                      tokenA0Balance.decimals,
                    ),

                    field: Field.CURRENCY_A,
                  });
                }
                if (tokenA1Balance && tokenAStandard === Standard.ERC223) {
                  setTypedValue({
                    typedValue: formatUnits(
                      tokenA1Balance.value / BigInt(2),
                      tokenA1Balance.decimals,
                    ),

                    field: Field.CURRENCY_A,
                  });
                }
              }
            : undefined
        }
        isHalf={
          (tokenAStandard === Standard.ERC20 &&
            tokenA0Balance &&
            typedValue !== "0" &&
            typedValue ===
              formatUnits(tokenA0Balance.value / BigInt(2), tokenA0Balance.decimals)) ||
          (tokenAStandard === Standard.ERC223 &&
            typedValue !== "0" &&
            tokenA1Balance &&
            typedValue === formatUnits(tokenA1Balance.value / BigInt(2), tokenA1Balance.decimals))
        }
        isMax={
          (tokenAStandard === Standard.ERC20 &&
            typedValue !== "0" &&
            tokenA0Balance &&
            typedValue === tokenA0Balance.formatted) ||
          (tokenAStandard === Standard.ERC223 &&
            typedValue !== "0" &&
            tokenA1Balance &&
            typedValue === tokenA1Balance.formatted)
        }
        label={t("you_pay")}
        standard={tokenAStandard}
        setStandard={setTokenAStandard}
      />
      <div className="relative h-3 z-10">
        <SwapButton
          onClick={() => {
            setTokenB(tokenA);
            setTokenA(tokenB);
            setTokenAStandard(tokenBStandard);
            setTokenBStandard(tokenAStandard);
            setTypedValue({
              typedValue: dependentAmount?.toSignificant() || "",
              field: Field.CURRENCY_A,
            });
          }}
        />
      </div>
      <TokenInput
        readOnly
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
        standard={tokenBStandard}
        setStandard={setTokenBStandard}
      />

      {tokenA && tokenB && typedValue ? (
        <div
          className={clsx(
            "rounded-3 py-3.5 flex flex-col md:flex-row justify-between duration-200 px-5 bg-tertiary-bg my-5 md:items-center",
          )}
          // role="button"
        >
          {computedGasSpending ? (
            <>
              <div className="flex items-center gap-1">
                <Tooltip
                  text={t("network_fee_tooltip", {
                    networkName: networks.find((n) => n.chainId === chainId)?.name,
                  })}
                />
                <div className="text-secondary-text text-14 flex items-center">
                  {t("network_fee")}
                </div>
              </div>

              <div className="flex items-center gap-2 justify-between md:justify-end">
                <span className="flex gap-2 items-center">
                  {gasPriceOption === GasOption.CUSTOM && (
                    <span className="flex items-center justify-center px-2 text-14 rounded-20 font-500 text-secondary-text bg-quaternary-bg">
                      {t(gasOptionTitle[gasPriceOption])}
                    </span>
                  )}
                  <div>
                    <span className="text-secondary-text mr-1 text-14">
                      {computedGasSpending} GWEI
                    </span>{" "}
                    <span className="mr-1 text-14">~$0.00</span>
                  </div>
                </span>

                <button
                  // disabled
                  className="border border-green flex px-4 rounded-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpenedFee(true);
                  }}
                >
                  {t("edit")}
                </button>
              </div>
            </>
          ) : (
            <span className="text-secondary-text text-14 flex items-center min-h-[26px]">
              Fetching best price...
            </span>
          )}
        </div>
      ) : (
        <div className="h-5" />
      )}

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
          (tokenAStandard === Standard.ERC20 &&
            (tokenA0Balance && tokenA
              ? tokenA0Balance?.value >= parseUnits(typedValue, tokenA.decimals)
              : false)) ||
          (tokenAStandard === Standard.ERC223 &&
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
