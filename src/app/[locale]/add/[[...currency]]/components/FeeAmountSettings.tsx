import clsx from "clsx";
import { useLocale } from "next-intl";
import { ButtonHTMLAttributes, useState } from "react";

import { useLiquidityTierStore } from "@/app/[locale]/add/[[...currency]]/hooks/useLiquidityTierStore";
import { useAddLiquidityTokensStore } from "@/app/[locale]/add/[[...currency]]/stores/useAddLiquidityTokensStore";
import Collapse from "@/components/atoms/Collapse";
import Svg from "@/components/atoms/Svg";
import { FEE_AMOUNT_DETAIL, FEE_TIERS } from "@/config/constants/liquidityFee";
import { FeeAmount } from "@/sdk";

import { useLiquidityPriceRangeStore } from "../stores/useLiquidityPriceRangeStore";

interface FeeAmountOptionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  feeAmount: FeeAmount;
}
function FeeAmountOption({ feeAmount, active = false, ...props }: FeeAmountOptionProps) {
  return (
    <button
      {...props}
      className={clsx(
        "flex justify-between items-center px-5 py-2 rounded-1 border cursor-pointer  duration-200",
        active
          ? "bg-green-bg shadow-select border-green pointer-events-none"
          : "border-transparent bg-primary-bg hover:bg-green-bg",
      )}
    >
      <div className="flex items-center gap-2">
        <span>{FEE_AMOUNT_DETAIL[feeAmount].label}% fee tier</span>
        {/*<TextLabel text="1% select" color="grey"/>*/}
      </div>
      <span className="text-secondary-text">{FEE_AMOUNT_DETAIL[feeAmount].description}</span>
    </button>
  );
}

export default function FeeAmountSettings() {
  const locale = useLocale();

  const [isFeeOpened, setIsFeeOpened] = useState(false);

  const { tier, setTier } = useLiquidityTierStore();
  const { tokenA, tokenB } = useAddLiquidityTokensStore();
  const { clearPriceRange } = useLiquidityPriceRangeStore();

  return (
    <div className="rounded-3 mb-5 bg-secondary-bg">
      <div
        role="button"
        onClick={() => setIsFeeOpened(!isFeeOpened)}
        className={clsx(
          "flex justify-between items-center pb-[18px] pt-5 px-5 rounded-3 duration-200",
          !isFeeOpened && "hover:bg-green-bg",
        )}
      >
        <div className="flex items-center gap-2">
          <span className="font-bold">{FEE_AMOUNT_DETAIL[tier].label}% fee tier</span>
          {/*<TextLabel text="67% select" color="grey"/>*/}
        </div>
        <span className="flex items-center gap-1 group">
          <span className="text-secondary-text">{isFeeOpened ? "Hide" : "Edit"}</span>
          <Svg
            iconName="expand-arrow"
            className={isFeeOpened ? "duration-200 -rotate-180" : "duration-200 "}
          />
        </span>
      </div>
      <Collapse open={isFeeOpened}>
        <div className="grid gap-2 pb-5 px-5">
          {FEE_TIERS.map((_feeAmount) => (
            <FeeAmountOption
              feeAmount={_feeAmount}
              key={_feeAmount}
              active={tier === _feeAmount}
              onClick={() => {
                setTier(_feeAmount);
                clearPriceRange();
                window.history.replaceState(
                  null,
                  "",
                  `/${locale}/add/${tokenA?.address}/${tokenB?.address}/${_feeAmount}`,
                );
              }}
            />
          ))}
        </div>
      </Collapse>
    </div>
  );
}
