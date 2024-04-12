import Image from "next/image";
import { ChangeEvent, useCallback, useState } from "react";
import { Address, formatUnits } from "viem";
import { useAccount, useBalance } from "wagmi";

import Badge from "@/components/badges/Badge";
import { RevokeDialog } from "@/components/dialogs/RevokeDialog";
import { WrappedToken } from "@/config/types/WrappedToken";

const InputRange = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
  return (
    <div className="relative h-6">
      <input
        value={value}
        max={100}
        step={1}
        min={0}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(+e.target.value)}
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
}: {
  token: WrappedToken;
  value: string;
  onChange: (value: string) => void;
}) {
  const { address } = useAccount();

  const { data: tokenBalance } = useBalance({
    address: address,
    token: token.address as Address,
  });

  return (
    <div>
      <div className="bg-primary-bg px-5 pt-5 pb-4">
        <div className="mb-1 flex justify-between items-center">
          <input
            className="text-20 bg-transparent flex-grow outline-0"
            placeholder="0"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="bg-secondary-bg rounded-5 py-1 pl-1 pr-3 flex items-center gap-2">
            <Image src={token?.logoURI || ""} alt="" width={24} height={24} />
            <span>{token.symbol}</span>
          </div>
        </div>
        <div className="flex justify-between items-center text-14">
          <span className="text-secondary-text">—</span>
          <span>{`Balance: ${tokenBalance ? formatUnits(tokenBalance.value, tokenBalance.decimals) : 0} ${token.symbol}`}</span>
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
  standard: "ERC-20" | "ERC-223";
  value?: number;
  onChange?: (value: number) => void;
  currentAllowance: bigint; // currentAllowance or currentDeposit
  token: WrappedToken;
  onRevoke: () => void; // onWithdraw or onWithdraw
  isRevoking: boolean; // isRevoking or isWithdrawing
}) {
  const [isOpenedRevokeDialog, setIsOpenedRevokeDialog] = useState(false);

  const revokeHandler = useCallback(() => {
    onRevoke();
  }, [onRevoke]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <span>Standard</span>
        <Badge color={standard === "ERC-20" ? "purple" : "green"} text={standard} />
      </div>
      <div className="bg-primary-bg px-5 pt-5 pb-4 w-full rounded-2">
        <div className="mb-1 flex justify-between items-center">
          <input
            className="bg-transparent outline-0 text-20 w-full"
            placeholder="0"
            type="text"
            value={value}
            // onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <div className="flex justify-end items-center text-14">
          <span>Balance: ?</span>
        </div>
      </div>
      <div className="flex justify-between">
        <span className="text-14 text-secondary-text">
          {/* TODO decimals */}
          {standard === "ERC-20"
            ? `Approved: ${formatUnits(currentAllowance || BigInt(0), token.decimals)} ${token.symbol}`
            : `Deposited: ${formatUnits(currentAllowance || BigInt(0), token.decimals)} ${token.symbol}`}
        </span>
        {!!currentAllowance ? (
          <span
            className="text-12 px-4 pt-[1px] pb-[2px] border border-green rounded-3 h-min cursor-pointer hover:text-green duration-200"
            onClick={() => setIsOpenedRevokeDialog(true)}
          >
            {standard === "ERC-20" ? "Revoke" : "Withdraw"}
          </span>
        ) : null}
      </div>
      <RevokeDialog
        standard={standard}
        amount={currentAllowance}
        token={token}
        revokeHandler={revokeHandler}
        isOpen={isOpenedRevokeDialog}
        setIsOpen={setIsOpenedRevokeDialog}
        isRevoking={isRevoking}
      />
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
  isRevoking,
  isWithdrawing,
}: {
  token: WrappedToken;
  value: string;
  onChange: (value: string) => void;
  currentAllowance?: bigint;
  currentDeposit?: bigint;
  revokeHandler: () => void;
  withdrawHandler: () => void;
  isDisabled: boolean;
  isWithdrawing: boolean;
  isRevoking: boolean;
}) {
  const [rangeValue, setRangeValue] = useState(50);

  // TODO BigInt
  const ERC223Value =
    typeof value !== "undefined" && value !== ""
      ? (parseFloat(value) / 100) * rangeValue
      : undefined;
  const ERC20Value =
    typeof value !== "undefined" && value !== "" && typeof ERC223Value !== "undefined"
      ? parseFloat(value) - ERC223Value
      : undefined;

  if (isDisabled) {
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
        <Image width={24} height={24} src={token?.logoURI || ""} alt="" />
        <h3 className="text-16 font-bold">{token.symbol} deposit amounts</h3>
      </div>
      <div className="text-secondary-text text-14 mb-3">Total balance: ???</div>
      <div className="flex flex-col gap-5">
        <InputTotalAmount token={token} value={value} onChange={onChange} />
        <InputRange value={rangeValue} onChange={setRangeValue} />
        <div className="flex justify-between gap-3 w-full">
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
