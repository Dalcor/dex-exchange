import clsx from "clsx";
import { useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";

import useSwap from "@/app/[locale]/swap/hooks/useSwap";
import { TokenTrade } from "@/app/[locale]/swap/libs/trading";
import { useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import { useSwapDetailsStateStore } from "@/app/[locale]/swap/stores/useSwapDetailsStateStore";
import { useSwapSettingsStore } from "@/app/[locale]/swap/stores/useSwapSettingsStore";
import Collapse from "@/components/atoms/Collapse";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import { formatFloat } from "@/functions/formatFloat";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { CurrencyAmount } from "@/sdk_hybrid/entities/fractions/currencyAmount";
import { Percent } from "@/sdk_hybrid/entities/fractions/percent";
import { Token } from "@/sdk_hybrid/entities/token";

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
export default function SwapDetails({
  trade,
  tokenA,
  tokenB,
}: {
  trade: TokenTrade;
  tokenA: Token;
  tokenB: Token;
}) {
  const t = useTranslations("Swap");
  const { isDetailsExpanded, setIsDetailsExpanded, setIsPriceInverted, isPriceInverted } =
    useSwapDetailsStateStore();
  const { typedValue } = useSwapAmountsStore();

  const dependentAmount: CurrencyAmount<Currency> | undefined = useMemo(() => {
    return trade?.outputAmount;
  }, [trade?.outputAmount]);

  const { slippage, deadline: _deadline } = useSwapSettingsStore();
  const { estimatedGas } = useSwap();

  return (
    <>
      <div
        className={clsx("mt-5 bg-tertiary-bg", !isDetailsExpanded ? "rounded-3" : "rounded-t-3")}
      >
        <div
          className={clsx(
            "h-12 flex justify-between duration-200 px-5 items-center text-secondary-text",
            !isDetailsExpanded ? "hover:bg-green-bg rounded-3" : "rounded-t-3",
          )}
          role="button"
          onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsPriceInverted(!isPriceInverted);
            }}
            className="text-14 flex items-center hover:text-green gap-1 duration-200"
          >
            <span>1 {isPriceInverted ? tokenB.symbol : tokenA.symbol}</span>
            <span>=</span>
            <span>
              {isPriceInverted
                ? trade.executionPrice.invert().toSignificant()
                : trade.executionPrice.toSignificant()}{" "}
              {isPriceInverted ? tokenA.symbol : tokenB.symbol} ($0.00)
            </span>
            <Svg iconName="swap" size={16} />
          </button>

          <div className="flex items-center gap-3">
            <div className=" text-14 flex items-center">{t("swap_details")}</div>
            <span>
              <Svg
                className={clsx("duration-200", isDetailsExpanded && "-rotate-180")}
                iconName="small-expand-arrow"
              />
            </span>
          </div>
        </div>
      </div>
      <Collapse open={isDetailsExpanded}>
        <div className="flex flex-col gap-2 pb-4 px-5 bg-tertiary-bg rounded-b-3 text-14">
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
      </Collapse>
    </>
  );
}
