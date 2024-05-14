import { formatEther, formatGwei } from "viem";
import { useAccount } from "wagmi";

import TokenDepositCard from "@/app/[locale]/add/components/DepositAmounts/TokenDepositCard";
import {
  Field,
  useLiquidityAmountsStore,
} from "@/app/[locale]/add/stores/useAddLiquidityAmountsStore";
import Tooltip from "@/components/atoms/Tooltip";
import { formatFloat } from "@/functions/formatFloat";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { CurrencyAmount } from "@/sdk_hybrid/entities/fractions/currencyAmount";
import { Token } from "@/sdk_hybrid/entities/token";

import { ApproveTransaction } from "../../hooks/useLiquidityApprove";
import { FeeDetailsButton } from "../FeeDetailsButton";

export const DepositAmounts = ({
  parsedAmounts,
  currencies,
  currentAllowanceA,
  currentAllowanceB,
  currentDepositA,
  currentDepositB,
  revokeA,
  revokeB,
  withdrawA,
  withdrawB,
  depositADisabled,
  depositBDisabled,
  isRevokingA,
  isRevokingB,
  isWithdrawingA,
  isWithdrawingB,
  approveTransactions,
  gasPrice,
  isFormDisabled,
}: {
  currentAllowanceA?: bigint;
  currentAllowanceB?: bigint;
  currentDepositA?: bigint;
  currentDepositB?: bigint;
  parsedAmounts: { [field in Field]: CurrencyAmount<Currency> | undefined };
  currencies: {
    CURRENCY_A: Token | undefined;
    CURRENCY_B: Token | undefined;
  };
  revokeA: () => void;
  revokeB: () => void;
  withdrawA: () => void;
  withdrawB: () => void;
  depositADisabled: boolean;
  depositBDisabled: boolean;
  isWithdrawingA: boolean;
  isWithdrawingB: boolean;
  isRevokingA: boolean;
  isRevokingB: boolean;
  approveTransactions: ApproveTransaction[];
  gasPrice?: bigint;
  isFormDisabled: boolean;
}) => {
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
  const { chain } = useAccount();

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? "",
  };

  const totalGasLimit = approveTransactions.reduce((acc, { estimatedGas }) => {
    return estimatedGas ? acc + estimatedGas : acc;
  }, BigInt(0));

  return (
    <div className="flex flex-col gap-5">
      <TokenDepositCard
        value={formattedAmounts[Field.CURRENCY_A]}
        onChange={(value) => setTypedValue({ field: Field.CURRENCY_A, typedValue: value })}
        token={currencies[Field.CURRENCY_A]}
        currentAllowance={currentAllowanceA}
        currentDeposit={currentDepositA}
        revokeHandler={revokeA}
        withdrawHandler={withdrawA}
        isDisabled={isFormDisabled}
        isOutOfRange={depositADisabled}
        isRevoking={isRevokingA}
        isWithdrawing={isWithdrawingA}
        tokenStandardRatio={tokenAStandardRatio}
        setTokenStandardRatio={setTokenAStandardRatio}
      />
      <div className="px-5 py-2 flex justify-between bg-tertiary-bg rounded-3">
        <div className="flex flex-col">
          <div className="text-secondary-text flex items-center gap-1 text-14">
            Gas price
            <Tooltip iconSize={20} text="Tooltip text" />
          </div>
          <span>{gasPrice ? formatFloat(formatGwei(gasPrice)) : ""} GWEI</span>
        </div>
        <div className="flex flex-col">
          <div className="text-secondary-text text-14">Total fee</div>
          <div>{`${gasPrice ? formatFloat(formatEther(gasPrice * totalGasLimit)) : ""} ${chain?.nativeCurrency.symbol}`}</div>
        </div>
        <div className="flex flex-col">
          <div className="text-secondary-text text-14">Transactions</div>
          <div>{approveTransactions.length + 1}</div>
        </div>
        <FeeDetailsButton
          approveTransactions={approveTransactions}
          gasPrice={gasPrice}
          isDisabled={isFormDisabled}
        />
      </div>
      <TokenDepositCard
        value={formattedAmounts[Field.CURRENCY_B]}
        onChange={(value) => setTypedValue({ field: Field.CURRENCY_B, typedValue: value })}
        token={currencies[Field.CURRENCY_B]}
        currentAllowance={currentAllowanceB}
        currentDeposit={currentDepositB}
        revokeHandler={revokeB}
        withdrawHandler={withdrawB}
        isDisabled={isFormDisabled}
        isOutOfRange={depositBDisabled}
        isRevoking={isRevokingB}
        isWithdrawing={isWithdrawingB}
        tokenStandardRatio={tokenBStandardRatio}
        setTokenStandardRatio={setTokenBStandardRatio}
      />
    </div>
  );
};
