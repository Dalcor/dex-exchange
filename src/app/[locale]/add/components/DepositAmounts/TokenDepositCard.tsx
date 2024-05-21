import clsx from "clsx";
import Image from "next/image";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import { Address, formatUnits } from "viem";
import { useAccount, useBalance, useBlockNumber } from "wagmi";

import Badge from "@/components/badges/Badge";
import { RevokeDialog } from "@/components/dialogs/RevokeDialog";
import { formatFloat } from "@/functions/formatFloat";
import { Token, TokenStandard } from "@/sdk_hybrid/entities/token";

export const InputRange = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: 0 | 100) => void;
}) => {
  return (
    <div className="relative h-6">
      <input
        value={value}
        max={100}
        step={100}
        min={0}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(+e.target.value as 0 | 100)}
        className="w-full accent-green absolute top-2 left-0 right-0 duration-200 !bg-purple"
        type="range"
      />
      <div
        className="pointer-events-none absolute bg-green h-2 rounded-1 left-0 top-2"
        style={{ width: value === 1 ? 0 : `calc(${value}% - 2px)` }}
      />
      {/* <div
        className="pointer-events-none absolute bg-purple h-2 rounded-1 right-0 top-2"
        style={{ width: value === 1 ? 0 : `calc(${100 - value}% - 2px)` }}
      /> */}
    </div>
  );
};
function InputTotalAmount({
  token,
  value,
  onChange,
  isDisabled,
}: {
  token?: Token;
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
}) {
  const { address } = useAccount();

  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { data: token0Balance, refetch: refetchBalance0 } = useBalance({
    address: token ? address : undefined,
    token: token ? (token.address0 as Address) : undefined,
  });
  const { data: token1Balance, refetch: refetchBalance1 } = useBalance({
    address: token ? address : undefined,
    token: token ? (token.address1 as Address) : undefined,
  });

  useEffect(() => {
    refetchBalance0();
    refetchBalance1();
  }, [blockNumber, refetchBalance0, refetchBalance1]);

  const totalBalance = (token0Balance?.value || BigInt(0)) + (token1Balance?.value || BigInt(0));

  return (
    <div>
      <div className="bg-primary-bg px-5 pt-5 pb-4 rounded-3">
        <div className="mb-1 flex justify-between items-center">
          <NumericFormat
            inputMode="decimal"
            placeholder="0.0"
            className={clsx("bg-transparent outline-0 border-0 text-20 w-full peer")}
            type="text"
            value={value}
            onValueChange={(values) => {
              onChange(values.value);
            }}
            allowNegative={false}
            disabled={isDisabled}
          />
          <div className="bg-secondary-bg rounded-5 py-1 pl-1 pr-3 flex items-center gap-2 min-w-[100px]">
            {token ? (
              <>
                <Image src={token?.logoURI || ""} alt="" width={24} height={24} />
                <span>{token.symbol}</span>
              </>
            ) : (
              <span>Select token</span>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center text-14">
          <span className="text-secondary-text">—</span>
          <span className="text-14 md:text-16">
            {token &&
              `Balance: ${formatFloat(formatUnits(totalBalance, token.decimals))} ${token.symbol}`}
          </span>
        </div>
      </div>
    </div>
  );
}

function InputStandardAmount({
  standard,
  value,
  onChange,
  currentAllowance,
  token,
  onRevoke,
  isRevoking,
}: {
  standard: TokenStandard;
  value?: number;
  onChange?: (value: number) => void;
  currentAllowance: bigint; // currentAllowance or currentDeposit
  token?: Token;
  onRevoke: () => void; // onWithdraw or onWithdraw
  isRevoking: boolean; // isRevoking or isWithdrawing
}) {
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const tokenAddress = standard === "ERC-20" ? token?.address0 : token?.address1;
  const { data: tokenBalance, refetch: refetchBalance } = useBalance({
    address: token ? address : undefined,
    token: token ? (tokenAddress as Address) : undefined,
  });

  useEffect(() => {
    refetchBalance();
  }, [blockNumber, refetchBalance]);

  const [isOpenedRevokeDialog, setIsOpenedRevokeDialog] = useState(false);
  const revokeHandler = useCallback(() => {
    onRevoke();
  }, [onRevoke]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span>Standard</span>
        <Badge color={standard === "ERC-20" ? "purple" : "green"} text={standard} />
      </div>
      <div className="bg-primary-bg px-4 py-2 md:p-5 w-full rounded-2">
        <div className="mb-1 flex justify-between items-center">
          <input
            className="bg-transparent outline-0 text-16 md:text-20 w-full"
            placeholder="0"
            type="text"
            value={value || ""}
            // onChange={(e) => onChange(e.target.value)}
            onChange={() => {}}
          />
        </div>
        <div className="flex justify-end items-center text-10 md:text-14">
          <span>
            {token &&
              `Balance: ${formatFloat(formatUnits(tokenBalance?.value || BigInt(0), token.decimals))} ${token.symbol}`}
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        {token && (
          <span className="text-12 text-secondary-text">
            {standard === "ERC-20"
              ? `Approved: ${formatFloat(formatUnits(currentAllowance || BigInt(0), token.decimals))} ${token.symbol}`
              : `Deposited: ${formatFloat(formatUnits(currentAllowance || BigInt(0), token.decimals))} ${token.symbol}`}
          </span>
        )}
        {!!currentAllowance ? (
          <span
            className="text-12 px-4 pt-[1px] pb-[2px] border border-green rounded-3 h-min cursor-pointer hover:text-green duration-200"
            onClick={() => setIsOpenedRevokeDialog(true)}
          >
            {standard === "ERC-20" ? "Revoke" : "Withdraw"}
          </span>
        ) : null}
      </div>
      {token && (
        <RevokeDialog
          standard={standard}
          amount={currentAllowance}
          token={token}
          revokeHandler={revokeHandler}
          isOpen={isOpenedRevokeDialog}
          setIsOpen={setIsOpenedRevokeDialog}
          isRevoking={isRevoking}
        />
      )}
    </div>
  );
}

export default function TokenDepositCard({
  token,
  value,
  onChange,
  currentAllowance,
  currentDeposit,
  revokeHandler,
  withdrawHandler,
  isDisabled,
  isOutOfRange,
  isRevoking,
  isWithdrawing,
  tokenStandardRatio,
  setTokenStandardRatio,
}: {
  token?: Token;
  value: string;
  onChange: (value: string) => void;
  currentAllowance?: bigint;
  currentDeposit?: bigint;
  revokeHandler: () => void;
  withdrawHandler: () => void;
  isDisabled: boolean;
  isOutOfRange: boolean;
  isWithdrawing: boolean;
  isRevoking: boolean;
  tokenStandardRatio: 0 | 100;
  setTokenStandardRatio: (ratio: 0 | 100) => void;
}) {
  // TODO BigInt
  const ERC223Value =
    typeof value !== "undefined" && value !== ""
      ? (parseFloat(value) / 100) * tokenStandardRatio
      : undefined;
  const ERC20Value =
    typeof value !== "undefined" && value !== "" && typeof ERC223Value !== "undefined"
      ? parseFloat(value) - ERC223Value
      : undefined;

  if (isOutOfRange) {
    return (
      <div className="flex justify-center items-center rounded-3 bg-tertiary-bg p-5 min-h-[320px]">
        <span className="text-center text-secondary-text">
          The market price is outside your specified price range. Single-asset deposit only.
        </span>
      </div>
    );
  }
  return (
    <div className="rounded-3 bg-secondary-bg p-5">
      <div className="flex items-center gap-2 mb-3">
        {token && <Image width={24} height={24} src={token?.logoURI || ""} alt="" />}
        <h3 className="text-16 font-bold">
          {token ? `${token?.symbol} deposit amounts` : "Select token"}
        </h3>
      </div>
      <div className="flex flex-col gap-5">
        <InputTotalAmount token={token} value={value} onChange={onChange} isDisabled={isDisabled} />
        <InputRange value={tokenStandardRatio} onChange={setTokenStandardRatio} />
        <div className="flex flex-col md:flex-row justify-between gap-4 w-full">
          <InputStandardAmount
            standard="ERC-20"
            value={ERC20Value}
            currentAllowance={currentAllowance || BigInt(0)}
            token={token}
            onRevoke={revokeHandler}
            isRevoking={isRevoking}
          />
          <InputStandardAmount
            standard="ERC-223"
            value={ERC223Value}
            token={token}
            currentAllowance={currentDeposit || BigInt(0)}
            onRevoke={withdrawHandler}
            isRevoking={isWithdrawing}
          />
        </div>
      </div>
    </div>
  );
}
