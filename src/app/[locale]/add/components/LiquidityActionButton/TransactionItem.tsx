import clsx from "clsx";
import { useMemo, useState } from "react";
import { NumericFormat } from "react-number-format";
import { formatEther, formatGwei, formatUnits, parseUnits } from "viem";

import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Badge from "@/components/badges/Badge";
import { formatFloat } from "@/functions/formatFloat";
import { AllowanceStatus } from "@/hooks/useAllowance";
import { Standard } from "@/sdk_hybrid/standard";

import { ApproveTransaction } from "../../hooks/useLiquidityApprove";

export const TransactionItem = ({
  transaction,
  standard,
  gasPrice,
  chainSymbol,
  index,
  itemsCount,
  isError,
  setFieldError,
  setCustomAmount,
}: {
  transaction?: ApproveTransaction;
  gasPrice: any;
  chainSymbol: string;
  standard: Standard;
  index: number;
  itemsCount: number;
  isError: boolean;
  setFieldError: (isError: boolean) => void;
  setCustomAmount: (amount: bigint) => void;
}) => {
  const [localValue, setLocalValue] = useState(
    formatUnits(transaction?.amount || BigInt(0), transaction?.token.decimals || 18),
  );
  const localValueBigInt = useMemo(() => {
    if (!transaction) return BigInt(0);
    return parseUnits(localValue, transaction.token.decimals);
  }, [localValue, transaction]);

  const updateValue = (value: string) => {
    if (!transaction?.token) return;
    setLocalValue(value);
    const valueBigInt = parseUnits(value, transaction.token.decimals);
    setCustomAmount(valueBigInt);

    if (transaction.amount) {
      setFieldError(valueBigInt < transaction.amount ? true : false);
    }
  };
  if (!transaction) return null;

  const { token, amount, estimatedGas, isAllowed, status } = transaction;

  return (
    <div className="flex gap-2">
      <div className="flex flex-col items-center">
        <div className="flex justify-center items-center rounded-full min-h-10 min-w-10 w-10 h-10 bg-green-bg">
          {index + 1}
        </div>
        {index + 1 < itemsCount ? (
          <div className="w-[2px] bg-green-bg h-full my-2 rounded-3"></div>
        ) : null}
      </div>
      <div className="w-full">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 py-2 items-center">
            <span>{`${standard === Standard.ERC20 ? "Approve" : "Deposit"} for ${token.symbol}`}</span>
            <Badge color="green" text={standard} />
          </div>

          <div className="flex items-center gap-2 justify-end">
            {localValueBigInt !== amount &&
            ![AllowanceStatus.PENDING, AllowanceStatus.LOADING].includes(status) ? (
              <div
                className="flex gap-2 text-green cursor-pointer"
                onClick={() => {
                  updateValue(formatUnits(amount, token.decimals));
                }}
              >
                <span>Set Default</span>
                <Svg iconName="reset" />
              </div>
            ) : null}
            {status === AllowanceStatus.PENDING && (
              <>
                <Preloader type="linear" />
                <span className="text-secondary-text text-14">Proceed in your wallet</span>
              </>
            )}
            {status === AllowanceStatus.LOADING ? (
              <Preloader size={20} />
            ) : (
              (isAllowed || status === AllowanceStatus.SUCCESS) && (
                <Svg className="text-green" iconName="done" size={20} />
              )
            )}
          </div>
        </div>
        <div
          className={clsx(
            "flex justify-between bg-secondary-bg px-5 py-3 rounded-3 mt-2 border ",
            isError ? "border-red" : "border-transparent",
          )}
        >
          <NumericFormat
            inputMode="decimal"
            placeholder="0.0"
            className={clsx("bg-transparent text-primary-text outline-0 border-0 w-full peer ")}
            type="text"
            value={localValue}
            onValueChange={(values) => {
              updateValue(values.value);
            }}
            allowNegative={false}
          />
          <span className="text-secondary-text min-w-max">{`Amount ${token.symbol}`}</span>
        </div>
        {isError ? (
          <span className="text-12 mt-2 text-red">{`Must be at least ${formatUnits(amount, token.decimals)} ${token.symbol}`}</span>
        ) : null}
        <div className="flex justify-between bg-tertiary-bg px-5 py-3 rounded-3 mb-5 mt-2">
          <div className="flex flex-col">
            <span className="text-14 text-secondary-text">Gas price</span>
            <span>{gasPrice ? formatFloat(formatGwei(gasPrice)) : ""} GWEI</span>
          </div>
          <div className="flex flex-col">
            <span className="text-14 text-secondary-text">Gas limit</span>
            <span>{estimatedGas?.toString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-14 text-secondary-text">Fee</span>
            <span>{`${gasPrice && estimatedGas ? formatFloat(formatEther(gasPrice * estimatedGas)) : ""} ${chainSymbol}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
