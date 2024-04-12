import TokenDepositCard from "@/app/[locale]/add/[[...currency]]/components/DepositAmounts/TokenDepositCard";
import {
  Field,
  useLiquidityAmountsStore,
} from "@/app/[locale]/add/[[...currency]]/stores/useAddLiquidityAmountsStore";
import Button from "@/components/atoms/Button";
import Tooltip from "@/components/atoms/Tooltip";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { CurrencyAmount } from "@/sdk_hybrid/entities/fractions/currencyAmount";
import { Token } from "@/sdk_hybrid/entities/token";

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
}) => {
  const { typedValue, independentField, dependentField, setTypedValue } =
    useLiquidityAmountsStore();

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? "",
  };

  return (
    <div className="flex flex-col gap-5">
      {currencies[Field.CURRENCY_A] && (
        <TokenDepositCard
          value={formattedAmounts[Field.CURRENCY_A]}
          onChange={(value) => setTypedValue({ field: Field.CURRENCY_A, typedValue: value })}
          token={currencies[Field.CURRENCY_A]}
          currentAllowance={currentAllowanceA}
          currentDeposit={currentDepositA}
          revokeHandler={revokeA}
          withdrawHandler={withdrawA}
          isDisabled={depositADisabled}
          isRevoking={isRevokingA}
          isWithdrawing={isWithdrawingA}
        />
      )}
      <div className="px-5 py-2 flex justify-between bg-tertiary-bg rounded-3">
        <div className="flex flex-col">
          <div className="text-secondary-text flex items-center gap-1 text-14">
            Gas price
            <Tooltip iconSize={20} text="Tooltip text" />
          </div>
          <div>33.53 GWEI</div>
        </div>
        <div className="flex flex-col">
          <div className="text-secondary-text text-14">Total fee</div>
          <div>0.005 ETH</div>
        </div>
        <div className="flex flex-col">
          <div className="text-secondary-text text-14">Transactions</div>
          <div>2</div>
        </div>
        <div>
          <Button size="x-small" variant="outline">
            Details
          </Button>
        </div>
      </div>
      {currencies[Field.CURRENCY_B] && (
        <TokenDepositCard
          value={formattedAmounts[Field.CURRENCY_B]}
          onChange={(value) => setTypedValue({ field: Field.CURRENCY_B, typedValue: value })}
          token={currencies[Field.CURRENCY_B]}
          currentAllowance={currentAllowanceB}
          currentDeposit={currentDepositB}
          revokeHandler={revokeB}
          withdrawHandler={withdrawB}
          isDisabled={depositBDisabled}
          isRevoking={isRevokingB}
          isWithdrawing={isWithdrawingB}
        />
      )}
    </div>
  );
};
