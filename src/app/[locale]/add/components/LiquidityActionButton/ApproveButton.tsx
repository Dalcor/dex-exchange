import clsx from "clsx";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { NumericFormat } from "react-number-format";
import { formatEther, formatGwei, formatUnits, parseUnits } from "viem";

import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Badge from "@/components/badges/Badge";
import Button from "@/components/buttons/Button";
import { formatFloat } from "@/functions/formatFloat";
import { getChainSymbol } from "@/functions/getChainSymbol";
import { AllowanceStatus } from "@/hooks/useAllowance";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { TokenStandard } from "@/sdk_hybrid/entities/token";

import {
  ApproveTransaction,
  ApproveTransactionType,
  useLiquidityApprove,
} from "../../hooks/useLiquidityApprove";

const APPROVE_BUTTON_TEXT = {
  [ApproveTransactionType.ERC20_AND_ERC223]: "button_approve_and_deposit",
  [ApproveTransactionType.ERC20]: "button_approve",
  [ApproveTransactionType.ERC223]: "button_deposit",
};

const TransactionItem = ({
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
  standard: TokenStandard;
  chainSymbol: string;
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
            <span>{`${standard === "ERC-20" ? "Approve" : "Deposit"} for ${token.symbol}`}</span>
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
            {status === AllowanceStatus.LOADING && <Preloader size={20} />}
            {(isAllowed || status === AllowanceStatus.SUCCESS) && (
              <Svg className="text-green" iconName="done" size={20} />
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
export const ApproveButton = () => {
  const t = useTranslations("Liquidity");
  const [isOpen, setIsOpen] = useState(false);
  const chainId = useCurrentChainId();
  const chainSymbol = getChainSymbol(chainId);
  const {
    handleApprove,
    approveTransactionsType,
    gasPrice,
    approveTransactions,
    approveTotalGasLimit,
  } = useLiquidityApprove();

  const isLoadingA20 = approveTransactions.approveA
    ? [AllowanceStatus.LOADING, AllowanceStatus.PENDING].includes(
        approveTransactions.approveA?.status,
      )
    : false;
  const isLoadingB20 = approveTransactions.approveB
    ? [AllowanceStatus.LOADING, AllowanceStatus.PENDING].includes(
        approveTransactions.approveB?.status,
      )
    : false;
  const isLoadingA223 = approveTransactions.depositA
    ? [AllowanceStatus.LOADING, AllowanceStatus.PENDING].includes(
        approveTransactions.depositA?.status,
      )
    : false;
  const isLoadingB223 = approveTransactions.depositB
    ? [AllowanceStatus.LOADING, AllowanceStatus.PENDING].includes(
        approveTransactions.depositB?.status,
      )
    : false;
  const isLoading = isLoadingA20 || isLoadingB20 || isLoadingA223 || isLoadingB223;

  // TODO change name of "token" field
  type TokenType = "tokenA" | "tokenB";
  const transactionItems = [
    {
      transaction: approveTransactions.approveA,
      standard: "ERC-20" as TokenStandard,
      token: "tokenA" as TokenType,
    },
    {
      transaction: approveTransactions.depositA,
      standard: "ERC-223" as TokenStandard,
      token: "tokenA" as TokenType,
    },
    {
      transaction: approveTransactions.approveB,
      standard: "ERC-20" as TokenStandard,
      token: "tokenB" as TokenType,
    },
    {
      transaction: approveTransactions.depositB,
      standard: "ERC-223" as TokenStandard,
      token: "tokenB" as TokenType,
    },
  ].filter(({ transaction }) => !!transaction);

  const [customAmounts, setCustomAmounts] = useState(
    {} as { customAmountA?: bigint; customAmountB?: bigint },
  );

  const [fieldsErrors, setFieldsErrors] = useState(
    {} as {
      [key: string]: boolean;
    },
  );
  const setFieldError = (key: string, isError: boolean) => {
    setFieldsErrors({ ...fieldsErrors, [key]: isError });
  };
  const isFormInvalid = Object.values(fieldsErrors).includes(true);

  return (
    <div>
      {/* TODO */}
      {isOpen ? (
        <Button fullWidth disabled>
          <span className="flex items-center gap-2">
            <span>Waiting for confirmation</span>
            <Preloader size={20} color="black" />
          </span>
        </Button>
      ) : (
        <Button onClick={() => setIsOpen(true)} fullWidth>
          {t(APPROVE_BUTTON_TEXT[approveTransactionsType] as any)}
        </Button>
      )}

      <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
        <DialogHeader
          onClose={() => setIsOpen(false)}
          title={`${t(APPROVE_BUTTON_TEXT[approveTransactionsType] as any)} ${t("approve_transaction_modal_title")}`}
        />
        <div className="w-full md:w-[570px] px-4 md:px-10 md:pb-10 pb-4 mx-auto">
          {transactionItems.map(
            (
              {
                transaction,
                standard,
                token,
              }: { transaction: any; standard: any; token: TokenType },
              index,
            ) => (
              <TransactionItem
                key={`${transaction.token.symbol}_${standard}`}
                transaction={transaction}
                standard={standard}
                gasPrice={gasPrice}
                chainSymbol={chainSymbol}
                index={index}
                itemsCount={transactionItems.length}
                isError={fieldsErrors[token]}
                setFieldError={(isError: boolean) => setFieldError(token, isError)}
                setCustomAmount={(amount: bigint) => {
                  if (token === "tokenA") {
                    setCustomAmounts({
                      ...customAmounts,
                      customAmountA: amount,
                    });
                  } else if (token === "tokenB") {
                    setCustomAmounts({
                      ...customAmounts,
                      customAmountB: amount,
                    });
                  }
                }}
              />
            ),
          )}
          <div className="flex gap-1 justify-center items-center border-t pt-4 border-secondary-border mb-4">
            <span className="text-secondary-text">{t("total_fee")}</span>
            <span className="font-bold">{`${gasPrice && approveTotalGasLimit ? formatFloat(formatEther(gasPrice * approveTotalGasLimit)) : ""} ${chainSymbol}`}</span>
          </div>

          {isFormInvalid ? (
            <Button fullWidth disabled>
              <span className="flex items-center gap-2">Enter correct values</span>
            </Button>
          ) : isLoading ? (
            <Button fullWidth disabled>
              <span className="flex items-center gap-2">
                <Preloader size={20} color="black" />
              </span>
            </Button>
          ) : (
            <Button
              onClick={() =>
                handleApprove({
                  customAmountA: customAmounts?.customAmountA,
                  customAmountB: customAmounts?.customAmountB,
                })
              }
              fullWidth
            >
              {t(APPROVE_BUTTON_TEXT[approveTransactionsType] as any)}
            </Button>
          )}
        </div>
      </DrawerDialog>
    </div>
  );
};
