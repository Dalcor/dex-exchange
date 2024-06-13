import { useState } from "react";
import { Chain, formatEther, formatGwei, formatUnits } from "viem";
import { useAccount } from "wagmi";

import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Badge from "@/components/badges/Badge";
import Button from "@/components/buttons/Button";
import { formatFloat } from "@/functions/formatFloat";
import { AllowanceStatus } from "@/hooks/useAllowance";
import { TokenStandard } from "@/sdk_hybrid/entities/token";

import {
  ApproveTransaction,
  ApproveTransactionType,
  useLiquidityApprove,
} from "../../hooks/useLiquidityApprove";

const APPROVE_BUTTON_TEXT = {
  [ApproveTransactionType.ERC20_AND_ERC223]: "Approve & Deposit",
  [ApproveTransactionType.ERC20]: "Approve",
  [ApproveTransactionType.ERC223]: "Deposit",
};

const TransactionItem = ({
  transaction,
  standard,
  gasPrice,
  chain,
  index,
  itemsCount,
}: {
  transaction?: ApproveTransaction;
  gasPrice: any;
  standard: TokenStandard;
  chain?: Chain;
  index: number;
  itemsCount: number;
}) => {
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
        <div className="flex justify-between bg-secondary-bg px-5 py-3 rounded-3 text-secondary-text mt-2">
          <span>{formatUnits(amount || BigInt(0), token.decimals)}</span>
          <span>{`Amount ${token.symbol}`}</span>
        </div>
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
            <span>{`${gasPrice && estimatedGas ? formatFloat(formatEther(gasPrice * estimatedGas)) : ""} ${chain?.nativeCurrency.symbol}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export const ApproveButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { chain } = useAccount();

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

  const transactionItems = [
    {
      transaction: approveTransactions.approveA,
      standard: "ERC-20" as TokenStandard,
    },
    {
      transaction: approveTransactions.depositA,
      standard: "ERC-223" as TokenStandard,
    },
    {
      transaction: approveTransactions.approveB,
      standard: "ERC-20" as TokenStandard,
    },
    {
      transaction: approveTransactions.depositB,
      standard: "ERC-223" as TokenStandard,
    },
  ].filter(({ transaction }) => !!transaction);
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
          {APPROVE_BUTTON_TEXT[approveTransactionsType]}
        </Button>
      )}

      <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
        <DialogHeader
          onClose={() => setIsOpen(false)}
          title={`${APPROVE_BUTTON_TEXT[approveTransactionsType]} transactions`}
        />
        <div className="w-full md:w-[570px] px-4 md:px-10 md:pb-10 pb-4 mx-auto">
          {transactionItems.map(({ transaction, standard }: any, index) => (
            <TransactionItem
              key={`${transaction.token.symbol}_${standard}`}
              transaction={transaction}
              standard={standard}
              gasPrice={gasPrice}
              chain={chain}
              index={index}
              itemsCount={transactionItems.length}
            />
          ))}
          <div className="flex gap-1 justify-center items-center border-t pt-4 border-secondary-border mb-4">
            <span className="text-secondary-text">Total fee</span>
            <span className="font-bold">{`${gasPrice && approveTotalGasLimit ? formatFloat(formatEther(gasPrice * approveTotalGasLimit)) : ""} ${chain?.nativeCurrency.symbol}`}</span>
          </div>

          {isLoading ? (
            <Button fullWidth disabled>
              <span className="flex items-center gap-2">
                <Preloader size={20} color="black" />
              </span>
            </Button>
          ) : (
            <Button onClick={handleApprove} fullWidth>
              {APPROVE_BUTTON_TEXT[approveTransactionsType]}
            </Button>
          )}
        </div>
      </DrawerDialog>
    </div>
  );
};
