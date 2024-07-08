import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { PropsWithChildren, ReactNode, useMemo } from "react";
import { Address, formatGwei } from "viem";
import { useGasPrice } from "wagmi";

import useSwap, { useSwapStatus } from "@/app/[locale]/swap/hooks/useSwap";
import { useTrade } from "@/app/[locale]/swap/libs/trading";
import { useConfirmSwapDialogStore } from "@/app/[locale]/swap/stores/useConfirmSwapDialogOpened";
import { useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import { useSwapEstimatedGasStore } from "@/app/[locale]/swap/stores/useSwapEstimatedGasStore";
import { useSwapGasSettingsStore } from "@/app/[locale]/swap/stores/useSwapGasSettingsStore";
import { useSwapSettingsStore } from "@/app/[locale]/swap/stores/useSwapSettingsStore";
import { useSwapStatusStore } from "@/app/[locale]/swap/stores/useSwapStatusStore";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import Badge from "@/components/badges/Badge";
import Button from "@/components/buttons/Button";
import IconButton from "@/components/buttons/IconButton";
import { Standard } from "@/components/common/TokenInput";
import { networks } from "@/config/networks";
import { clsxMerge } from "@/functions/clsxMerge";
import { formatFloat } from "@/functions/formatFloat";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { DexChainId } from "@/sdk_hybrid/chains";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { CurrencyAmount } from "@/sdk_hybrid/entities/fractions/currencyAmount";
import { Percent } from "@/sdk_hybrid/entities/fractions/percent";
import { Token } from "@/sdk_hybrid/entities/token";
import { GasFeeModel } from "@/stores/useRecentTransactionsStore";

function ApproveRow({
  logoURI = "",
  isPending = false,
  isLoading = false,
  isSuccess = false,
  hash,
}: {
  logoURI: string | undefined;
  isLoading?: boolean;
  isPending?: boolean;
  isSuccess?: boolean;
  hash?: Address | undefined;
}) {
  const t = useTranslations("Swap");

  return (
    <div
      className={clsx(
        "grid grid-cols-[32px_1fr_1fr] gap-2 h-10 before:absolute relative before:left-[15px] before:-bottom-4 before:w-0.5 before:h-3 before:rounded-1",
        isSuccess ? "before:bg-green" : "before:bg-green-bg",
      )}
    >
      <div className="flex items-center">
        <Image
          className={clsx(isSuccess && "", "rounded-full")}
          src={logoURI}
          alt=""
          width={32}
          height={32}
        />
      </div>

      <div className="flex flex-col justify-center">
        <span className={isSuccess ? "text-secondary-text text-14" : "text-14"}>
          {isSuccess ? t("approved") : t("approve")}
        </span>
        {!isSuccess && <span className="text-green text-12">{t("why_do_i_have_to_approve")}</span>}
      </div>
      <div className="flex items-center gap-2 justify-end">
        {hash && (
          <a
            target="_blank"
            href={getExplorerLink(ExplorerLinkType.TRANSACTION, hash, DexChainId.SEPOLIA)}
          >
            <IconButton iconName="forward" />
          </a>
        )}
        {isPending && (
          <>
            <Preloader type="linear" />
            <span className="text-secondary-text text-14">{t("proceed_in_your_wallet")}</span>
          </>
        )}
        {isLoading && <Preloader size={20} />}
        {isSuccess && <Svg className="text-green" iconName="done" size={20} />}
      </div>
    </div>
  );
}

function SwapRow({
  isPending = false,
  isLoading = false,
  isSuccess = false,
  isSettled = false,
  isReverted = false,
  isDisabled = false,
  hash,
}: {
  isLoading?: boolean;
  isPending?: boolean;
  isSettled?: boolean;
  isSuccess?: boolean;
  isReverted?: boolean;
  isDisabled?: boolean;
  hash?: Address | undefined;
}) {
  const t = useTranslations("Swap");

  return (
    <div className="grid grid-cols-[32px_1fr_1fr] gap-2 h-10">
      <div className="flex items-center h-full">
        <div
          className={clsxMerge(
            "p-1 rounded-full h-8 w-8",
            isDisabled ? "bg-tertiary-bg" : "bg-green",
            isReverted && "bg-red-bg",
          )}
        >
          <Svg
            className={clsxMerge(
              "rotate-90",
              isDisabled ? "text-tertiary-text" : "text-secondary-bg",
              isReverted && "text-red-input",
            )}
            iconName="swap"
          />
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <span className={clsx("text-14", isDisabled ? "text-tertiary-text" : "text-primary-text")}>
          {isPending && t("confirm_swap")}
          {isLoading && t("executing_swap")}
          {isReverted && "Failed to confirm a swap"}
          {isSuccess && "Executed swap"}
        </span>
        {!isSettled && <span className="text-green text-12">{t("learn_more_about_swap")}</span>}
      </div>
      <div className="flex items-center gap-2 justify-end">
        {hash && (
          <a
            target="_blank"
            href={getExplorerLink(ExplorerLinkType.TRANSACTION, hash, DexChainId.SEPOLIA)}
          >
            <IconButton iconName="forward" />
          </a>
        )}
        {isPending && (
          <>
            <Preloader type="linear" />
            <span className="text-secondary-text text-14">{t("proceed_in_your_wallet")}</span>
          </>
        )}
        {isLoading && <Preloader size={20} />}
        {isSuccess && <Svg className="text-green" iconName="done" size={20} />}
        {isReverted && <Svg className="text-red-input" iconName="warning" size={20} />}
      </div>
    </div>
  );
}
function Rows({ children }: PropsWithChildren<{}>) {
  return <div className="flex flex-col gap-5">{children}</div>;
}

function SwapActionButton() {
  const t = useTranslations("Swap");
  const { tokenA, tokenB, tokenAAddress } = useSwapTokensStore();
  const { typedValue } = useSwapAmountsStore();

  const { handleSwap } = useSwap();

  const {
    isPendingApprove,
    isLoadingApprove,
    isPendingSwap,
    isLoadingSwap,
    isSuccessSwap,
    isSettledSwap,
    isRevertedSwap,
  } = useSwapStatus();

  const { swapHash, approveHash } = useSwapStatusStore();

  console.log(approveHash);

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

  if (tokenA.address1 !== tokenAAddress) {
    if (isPendingApprove) {
      return (
        <Rows>
          <ApproveRow isPending logoURI={tokenA.logoURI} />
          <SwapRow isDisabled />
        </Rows>
      );
    }

    if (isLoadingApprove) {
      return (
        <Rows>
          <ApproveRow hash={approveHash} isLoading logoURI={tokenA.logoURI} />
          <SwapRow isDisabled />
        </Rows>
      );
    }
  }

  if (isPendingSwap) {
    return (
      <Rows>
        {tokenAAddress === tokenA.address0 && (
          <ApproveRow hash={approveHash} isSuccess logoURI={tokenA.logoURI} />
        )}
        <SwapRow isPending />
      </Rows>
    );
  }

  if (isLoadingSwap) {
    return (
      <Rows>
        {tokenAAddress === tokenA.address0 && (
          <ApproveRow hash={approveHash} isSuccess logoURI={tokenA.logoURI} />
        )}
        <SwapRow hash={swapHash} isLoading />
      </Rows>
    );
  }

  if (isSuccessSwap) {
    return (
      <Rows>
        {tokenAAddress === tokenA.address0 && (
          <ApproveRow hash={approveHash} isSuccess logoURI={tokenA.logoURI} />
        )}
        <SwapRow hash={swapHash} isSettled isSuccess />
      </Rows>
    );
  }

  if (isRevertedSwap) {
    return (
      <Rows>
        {tokenAAddress === tokenA.address0 && (
          <ApproveRow hash={approveHash} isSuccess logoURI={tokenA.logoURI} />
        )}
        <SwapRow hash={swapHash} isSettled isReverted />
      </Rows>
    );
  }

  return (
    <Button onClick={handleSwap} fullWidth>
      {t("confirm_swap")}
    </Button>
  );
}
function ReadonlyTokenAmountCard({
  token,
  amount,
  amountUSD,
  standard,
  title,
}: {
  token: Token | undefined;
  amount: string;
  amountUSD: string | undefined;
  standard: Standard;
  title: string;
}) {
  return (
    <div className="rounded-3 bg-tertiary-bg py-4 px-5 flex flex-col gap-1">
      <p className="text-secondary-text text-14">{title}</p>
      <div className="flex justify-between items-center text-20">
        <span>{amount}</span>
        <div className="flex items-center gap-2">
          <Image src={token?.logoURI || ""} alt="" width={32} height={32} />
          {token?.symbol}
          <Badge color="green" text={standard} />
        </div>
      </div>
      <p className="text-secondary-text text-14">${amountUSD}</p>
    </div>
  );
}

function SwapDetailsRow({
  title,
  value,
  tooltipText,
}: {
  title: string;
  value: string | ReactNode;
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
export default function ConfirmSwapDialog() {
  const t = useTranslations("Swap");
  const { tokenA, tokenB, tokenAAddress, tokenBAddress } = useSwapTokensStore();
  const { typedValue } = useSwapAmountsStore();
  const chainId = useCurrentChainId();

  const { isOpen, setIsOpen } = useConfirmSwapDialogStore();

  const { trade } = useTrade();

  const dependentAmount: CurrencyAmount<Currency> | undefined = useMemo(() => {
    return trade?.outputAmount;
  }, [trade?.outputAmount]);

  const output = useMemo(() => {
    if (!trade) {
      return "";
    }

    return trade.outputAmount.toSignificant();
  }, [trade]);

  const { slippage, deadline: _deadline } = useSwapSettingsStore();
  const {
    isPendingSwap,
    isLoadingSwap,
    isSuccessSwap,
    isLoadingApprove,
    isPendingApprove,
    isRevertedSwap,
    isSettledSwap,
  } = useSwapStatus();
  const { estimatedGas } = useSwapEstimatedGasStore();

  const isProcessing = useMemo(() => {
    return isPendingSwap || isLoadingSwap || isSettledSwap || isLoadingApprove || isPendingApprove;
  }, [isLoadingApprove, isLoadingSwap, isPendingApprove, isPendingSwap, isSettledSwap]);

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

    return "0.00";
  }, [baseFee, gasPrice]);

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="shadow-popup bg-primary-bg rounded-5 w-full md:w-[600px]">
        <DialogHeader onClose={() => setIsOpen(false)} title={t("review_swap")} />
        <div className="px-4 pb-4 md:px-10 md:pb-9">
          {!isSettledSwap && (
            <div className="flex flex-col gap-3">
              <ReadonlyTokenAmountCard
                token={tokenA}
                amount={typedValue}
                amountUSD={"0.00"}
                standard={tokenA?.address0 === tokenAAddress ? Standard.ERC20 : Standard.ERC223}
                title={t("you_pay")}
              />
              <ReadonlyTokenAmountCard
                token={tokenB}
                amount={output}
                amountUSD={"0.00"}
                standard={tokenB?.address0 === tokenBAddress ? Standard.ERC20 : Standard.ERC223}
                title={t("you_receive")}
              />
            </div>
          )}
          {isSettledSwap && (
            <div>
              <div className="mx-auto w-[80px] h-[80px] flex items-center justify-center relative mb-5">
                {isRevertedSwap && <EmptyStateIcon iconName="warning" />}

                {isSuccessSwap && (
                  <>
                    <div className="w-[54px] h-[54px] rounded-full border-[7px] blur-[8px] opacity-80 border-green" />
                    <Svg
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green"
                      iconName={"success"}
                      size={65}
                    />
                  </>
                )}
              </div>

              <div className="flex justify-center">
                <span className="text-20 font-bold text-primary-text mb-1">
                  {isRevertedSwap ? t("swap_failed") : t("successful_swap")}
                </span>
              </div>

              <div className="flex justify-center gap-2 items-center">
                <Image src={tokenA?.logoURI || ""} alt="" width={24} height={24} />
                <span>
                  {tokenA?.symbol} {typedValue}
                </span>
                <Svg iconName="next" />
                <Image src={tokenB?.logoURI || ""} alt="" width={24} height={24} />
                <span>
                  {tokenB?.symbol} {output}
                </span>
              </div>
            </div>
          )}
          {!isProcessing && (
            <div className="pb-4 flex flex-col gap-2 rounded-b-3 text-14 mt-4">
              {/*<SwapDetailsRow*/}
              {/*  title={t("token_price", { symbol: tokenA?.symbol })}*/}
              {/*  value={*/}
              {/*    trade ? `${trade.executionPrice.toSignificant()} ${tokenB?.symbol}` : "Loading..."*/}
              {/*  }*/}
              {/*  tooltipText={t("minimum_received_tooltip")}*/}
              {/*/>*/}
              <SwapDetailsRow
                title={t("network_fee")}
                value={
                  <div>
                    <span className="text-secondary-text mr-1 text-14">
                      {computedGasSpending} GWEI
                    </span>{" "}
                    <span className="mr-1 text-14">~$0.00</span>
                  </div>
                }
                tooltipText={t("network_fee_tooltip", {
                  networkName: networks.find((n) => n.chainId === chainId)?.name,
                })}
              />
              <SwapDetailsRow
                title={t("minimum_received")}
                value={
                  trade
                    ?.minimumAmountOut(new Percent(slippage * 100, 10000), dependentAmount)
                    .toSignificant() || "Loading..."
                }
                tooltipText={t("minimum_received_tooltip")}
              />
              <SwapDetailsRow
                title={t("price_impact")}
                value={trade ? `${formatFloat(trade.priceImpact.toSignificant())}%` : "Loading..."}
                tooltipText={t("price_impact_tooltip")}
              />
              <SwapDetailsRow
                title={t("trading_fee")}
                value={
                  typedValue && Boolean(+typedValue) && tokenA
                    ? `${(+typedValue * 0.3) / 100} ${tokenA.symbol}`
                    : "Loading..."
                }
                tooltipText={t("trading_fee_tooltip")}
              />
              <SwapDetailsRow
                title={t("order_routing")}
                value={t("direct_swap")}
                tooltipText={t("route_tooltip")}
              />
              <SwapDetailsRow
                title={t("maximum_slippage")}
                value={`${slippage}%`}
                tooltipText={t("maximum_slippage_tooltip")}
              />
              <SwapDetailsRow
                title={t("gas_limit")}
                value={estimatedGas?.toString() || "Loading..."}
                tooltipText={t("gas_limit_tooltip")}
              />
            </div>
          )}
          {isProcessing && <div className="h-px w-full bg-secondary-border mb-4 mt-5" />}
          <SwapActionButton />
        </div>
      </div>
    </DrawerDialog>
  );
}
