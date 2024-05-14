import clsx from "clsx";
import React, { useMemo, useState } from "react";

import useSwap from "@/app/[locale]/swap/hooks/useSwap";
import { TokenTrade } from "@/app/[locale]/swap/libs/trading";
import { useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import Collapse from "@/components/atoms/Collapse";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import { formatFloat } from "@/functions/formatFloat";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { CurrencyAmount } from "@/sdk_hybrid/entities/fractions/currencyAmount";
import { Percent } from "@/sdk_hybrid/entities/fractions/percent";
import { Token } from "@/sdk_hybrid/entities/token";
import { useTransactionSettingsStore } from "@/stores/useTransactionSettingsStore";

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
  const [expanded, setExpanded] = useState(false);
  const { typedValue } = useSwapAmountsStore();

  const dependentAmount: CurrencyAmount<Currency> | undefined = useMemo(() => {
    return trade?.outputAmount;
  }, [trade?.outputAmount]);

  const { slippage, deadline: _deadline } = useTransactionSettingsStore();
  const { estimatedGas } = useSwap();

  return (
    <>
      <div className={clsx("mt-5 bg-tertiary-bg", !expanded ? "rounded-3" : "rounded-t-3")}>
        <div
          className={clsx(
            "h-12 flex justify-between duration-200 px-5 items-center",
            !expanded ? "hover:bg-green-bg rounded-3" : "rounded-t-3",
          )}
          role="button"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="text-secondary-text text-14 flex items-center">Swap details</div>
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
              typedValue && Boolean(+typedValue)
                ? `${(+typedValue * 0.3) / 100} ${tokenA.symbol}`
                : "Loading..."
            }
            tooltipText="Minimum received tooltip"
          />
          <SwapDetailsRow
            title="Order routing"
            value="Direct swap"
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
    </>
  );
}
