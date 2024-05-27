import clsx from "clsx";
import Image from "next/image";
import React, { PropsWithChildren, useCallback, useMemo } from "react";
import { useAccount } from "wagmi";

import useSwap from "@/app/[locale]/swap/hooks/useSwap";
import { useTrade } from "@/app/[locale]/swap/libs/trading";
import { useConfirmSwapDialogStore } from "@/app/[locale]/swap/stores/useConfirmSwapDialogOpened";
import { useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import { useSwapSettingsStore } from "@/app/[locale]/swap/stores/useSwapSettingsStore";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import Badge from "@/components/badges/Badge";
import Button, { ButtonVariant } from "@/components/buttons/Button";
import { Standard } from "@/components/common/TokenInput";
import { formatFloat } from "@/functions/formatFloat";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { CurrencyAmount } from "@/sdk_hybrid/entities/fractions/currencyAmount";
import { Percent } from "@/sdk_hybrid/entities/fractions/percent";
import { Token } from "@/sdk_hybrid/entities/token";
import { useTransactionSettingsStore } from "@/stores/useTransactionSettingsStore";

function ApproveRow({
  logoURI = "",
  isPending = false,
  isLoading = false,
  isSuccess = false,
}: {
  logoURI: string | undefined;
  isLoading?: boolean;
  isPending?: boolean;
  isSuccess?: boolean;
}) {
  return (
    <div className="grid grid-cols-[32px_1fr_1fr] gap-2">
      <Image
        className={clsx(isSuccess && "", "rounded-full")}
        src={logoURI}
        alt=""
        width={32}
        height={32}
      />
      <div className="flex flex-col justify-center">
        <span className={isSuccess ? "text-secondary-text text-14" : "text-14"}>
          {isSuccess ? "Approved" : "Approve"}
        </span>
        {!isSuccess && (
          <span className="text-green text-12">Why do I have to approve a token?</span>
        )}
      </div>
      <div className="flex items-center gap-2 justify-end">
        {isPending && (
          <>
            <Preloader type="linear" />
            <span className="text-secondary-text text-14">Proceed in your wallet</span>
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
  isDisabled = false,
}: {
  isLoading?: boolean;
  isPending?: boolean;
  isSuccess?: boolean;
  isDisabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-[32px_1fr_1fr] gap-2">
      <div className="flex items-center">
        <div
          className={clsx("p-1 rounded-full h-8 w-8", isDisabled ? "bg-tertiary-bg" : "bg-green")}
        >
          <Svg
            className={clsx("rotate-90", isDisabled ? "text-tertiary-text" : "text-secondary-bg")}
            iconName="swap"
          />
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <span className={clsx("text-14", isDisabled ? "text-tertiary-text" : "text-primary-text")}>
          {isPending ? "Confirm swap" : "Executing swap"}
        </span>
        {!isSuccess && <span className="text-green text-12">Learn more about swap</span>}
      </div>
      <div className="flex items-center gap-2 justify-end">
        {isPending && (
          <>
            <Preloader type="linear" />
            <span className="text-secondary-text text-14">Proceed in your wallet</span>
          </>
        )}
        {isLoading && <Preloader size={20} />}
        {isSuccess && <Svg className="text-green" iconName="done" size={20} />}
      </div>
    </div>
  );
}
function Rows({ children }: PropsWithChildren<{}>) {
  return <div className="flex flex-col gap-5">{children}</div>;
}

function SwapActionButton() {
  const { tokenA, tokenB, tokenAAddress } = useSwapTokensStore();
  const { typedValue } = useSwapAmountsStore();

  const {
    isAllowedA,
    handleApprove,
    isPendingApprove,
    isLoadingApprove,

    handleSwap,
    isPendingSwap,
    isLoadingSwap,
    isSuccessSwap,
  } = useSwap();
  const { chainId } = useAccount();

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
          <ApproveRow isLoading logoURI={tokenA.logoURI} />
          <SwapRow isDisabled />
        </Rows>
      );
    }
  }

  if (isPendingSwap) {
    return (
      <Rows>
        {tokenAAddress === tokenA.address0 && <ApproveRow isSuccess logoURI={tokenA.logoURI} />}
        <SwapRow isPending />
      </Rows>
    );
  }

  if (isLoadingSwap) {
    return (
      <Rows>
        {tokenAAddress === tokenA.address0 && <ApproveRow isSuccess logoURI={tokenA.logoURI} />}
        <SwapRow isLoading />
      </Rows>
    );
  }

  if (isSuccessSwap) {
    return (
      <Rows>
        {tokenAAddress === tokenA.address0 && <ApproveRow isSuccess logoURI={tokenA.logoURI} />}
        <SwapRow isSuccess />
      </Rows>
    );
  }

  return (
    <Button onClick={handleSwap} fullWidth>
      Confirm swap
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
export default function ConfirmSwapDialog() {
  const { tokenA, tokenB, tokenAAddress, tokenBAddress } = useSwapTokensStore();
  const { typedValue } = useSwapAmountsStore();

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
    estimatedGas,
    isPendingSwap,
    isLoadingSwap,
    isSuccessSwap,
    isLoadingApprove,
    isPendingApprove,
  } = useSwap();

  const isProcessing = useMemo(() => {
    return isPendingSwap || isLoadingSwap || isSuccessSwap || isLoadingApprove || isPendingApprove;
  }, [isLoadingApprove, isLoadingSwap, isPendingApprove, isPendingSwap, isSuccessSwap]);

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="shadow-popup bg-primary-bg rounded-5 w-full md:w-[600px]">
        <DialogHeader onClose={() => setIsOpen(false)} title="Review swap" />
        <div className="px-4 pb-4 md:px-10 md:pb-9">
          {!isSuccessSwap && (
            <div className="flex flex-col gap-3">
              <ReadonlyTokenAmountCard
                token={tokenA}
                amount={typedValue}
                amountUSD={"0.00"}
                standard={tokenA?.address0 === tokenAAddress ? Standard.ERC20 : Standard.ERC223}
                title="You pay"
              />
              <ReadonlyTokenAmountCard
                token={tokenB}
                amount={output}
                amountUSD={"0.00"}
                standard={tokenB?.address0 === tokenBAddress ? Standard.ERC20 : Standard.ERC223}
                title="You receive"
              />
            </div>
          )}
          {isSuccessSwap && (
            <div>
              <div className="mx-auto w-[80px] h-[80px] flex items-center justify-center relative mb-5">
                <div className="w-[54px] h-[54px] rounded-full border-[7px] blur-[8px] opacity-80 border-green"></div>
                <Svg
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green"
                  iconName="success"
                  size={65}
                />
              </div>

              <div className="flex justify-center">
                <span className="text-20 font-bold text-primary-text mb-1">Successful swap</span>
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
              <SwapDetailsRow
                title={`${tokenA?.symbol} Price`}
                value={
                  trade ? `${trade.executionPrice.toSignificant()} ${tokenB?.symbol}` : "Loading..."
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
                value={trade ? `${formatFloat(trade.priceImpact.toSignificant())}%` : "Loading..."}
                tooltipText="Minimum received tooltip"
              />
              <SwapDetailsRow
                title="Trading fee"
                value={
                  typedValue && Boolean(+typedValue) && tokenA
                    ? `${(+typedValue * 0.3) / 100} ${tokenA.symbol}`
                    : "Loading..."
                }
                tooltipText="Minimum received tooltip"
              />
              <SwapDetailsRow
                title="Order routing"
                value="Direct swap"
                tooltipText="Order routing tooltip"
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
          )}
          {isProcessing && <div className="h-px w-full bg-secondary-border mb-4 mt-5" />}
          <SwapActionButton />
        </div>
      </div>
    </DrawerDialog>
  );
}
