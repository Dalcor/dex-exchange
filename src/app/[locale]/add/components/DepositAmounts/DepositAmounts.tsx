import clsx from "clsx";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { formatEther, formatGwei } from "viem";

import TokenDepositCard from "@/app/[locale]/add/components/DepositAmounts/TokenDepositCard";
import {
  Field,
  useLiquidityAmountsStore,
} from "@/app/[locale]/add/stores/useAddLiquidityAmountsStore";
import Tooltip from "@/components/atoms/Tooltip";
import { formatFloat } from "@/functions/formatFloat";
import { getChainSymbol } from "@/functions/getChainSymbol";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { CurrencyAmount } from "@/sdk_hybrid/entities/fractions/currencyAmount";
import { Token } from "@/sdk_hybrid/entities/token";
import { EstimatedGasId, useEstimatedGasStoreById } from "@/stores/useEstimatedGasStore";

import { useLiquidityApprove } from "../../hooks/useLiquidityApprove";
import { FeeDetailsButton } from "../FeeDetailsButton";

export const DepositAmounts = ({
  parsedAmounts,
  currencies,
  depositADisabled,
  depositBDisabled,
  isFormDisabled,
}: {
  parsedAmounts: { [field in Field]: CurrencyAmount<Currency> | undefined };
  currencies: {
    CURRENCY_A: Token | undefined;
    CURRENCY_B: Token | undefined;
  };
  depositADisabled: boolean;
  depositBDisabled: boolean;
  isFormDisabled: boolean;
}) => {
  const t = useTranslations("Liquidity");
  const tGas = useTranslations("GasSettings");
  const {
    typedValue,
    independentField,
    dependentField,
    setTypedValue,
    tokenAStandardRatio,
    tokenBStandardRatio,
    setTokenAStandardRatio,
    setTokenBStandardRatio,
  } = useLiquidityAmountsStore();
  const chainId = useCurrentChainId();

  const { gasPrice, approveTotalGasLimit, approveTransactionsCount } = useLiquidityApprove();
  const estimatedMintGas = useEstimatedGasStoreById(EstimatedGasId.mint);

  // get formatted amounts
  const formattedAmounts = useMemo(() => {
    return {
      [independentField]: typedValue,
      [dependentField]: parsedAmounts[dependentField]?.toSignificant() ?? "",
    };
  }, [dependentField, independentField, parsedAmounts, typedValue]);

  const totalGasLimit = useMemo(() => {
    return approveTotalGasLimit + estimatedMintGas;
  }, [approveTotalGasLimit, estimatedMintGas]);

  return (
    <div className={clsx("flex flex-col gap-4 md:gap-5", isFormDisabled && "opacity-20")}>
      <TokenDepositCard
        value={parsedAmounts[Field.CURRENCY_A]}
        formattedValue={formattedAmounts[Field.CURRENCY_A]}
        onChange={(value) => setTypedValue({ field: Field.CURRENCY_A, typedValue: value })}
        token={currencies[Field.CURRENCY_A]}
        isDisabled={isFormDisabled}
        isOutOfRange={depositADisabled}
        tokenStandardRatio={tokenAStandardRatio}
        setTokenStandardRatio={setTokenAStandardRatio}
        gasPrice={gasPrice}
      />
      <div className="flex flex-col items-center gap-2 md:flex-row px-5 py-2 bg-tertiary-bg rounded-3">
        <div className="flex w-full justify-between">
          <div className="flex flex-col">
            <div className="text-secondary-text flex items-center gap-1 text-14">
              {t("gas_price")}
              <Tooltip iconSize={20} text={tGas("gas_price_tooltip")} />
            </div>
            <span>{gasPrice ? formatFloat(formatGwei(gasPrice)) : ""} GWEI</span>
          </div>
          <div className="flex flex-col">
            <div className="text-secondary-text text-14">{t("total_fee")}</div>
            <div>{`${gasPrice ? formatFloat(formatEther(gasPrice * totalGasLimit)) : ""} ${getChainSymbol(chainId)}`}</div>
          </div>
          <div className="flex flex-col">
            <div className="text-secondary-text text-14">{t("transactions")}</div>
            <div>{approveTransactionsCount + 1}</div>
          </div>
        </div>
        <FeeDetailsButton isDisabled={isFormDisabled} />
      </div>
      <TokenDepositCard
        value={parsedAmounts[Field.CURRENCY_B]}
        formattedValue={formattedAmounts[Field.CURRENCY_B]}
        onChange={(value) => setTypedValue({ field: Field.CURRENCY_B, typedValue: value })}
        token={currencies[Field.CURRENCY_B]}
        isDisabled={isFormDisabled}
        isOutOfRange={depositBDisabled}
        tokenStandardRatio={tokenBStandardRatio}
        setTokenStandardRatio={setTokenBStandardRatio}
        gasPrice={gasPrice}
      />
    </div>
  );
};
