import clsx from "clsx";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import { Address, formatEther, formatGwei, formatUnits } from "viem";
import { useAccount, useBalance, useBlockNumber } from "wagmi";

import Dialog from "@/components/atoms/Dialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Badge from "@/components/badges/Badge";
import Button from "@/components/buttons/Button";
import { formatFloat } from "@/functions/formatFloat";
import { AllowanceStatus } from "@/hooks/useAllowance";
import useRevoke from "@/hooks/useRevoke";
import useWithdraw from "@/hooks/useWithdraw";
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/sdk_hybrid/addresses";
import { DexChainId } from "@/sdk_hybrid/chains";
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
  token,
  status,
  currentAllowance,
  revokeHandler,
  estimatedGas,
  gasPrice,
}: {
  standard: TokenStandard;
  value?: number;
  token?: Token;
  currentAllowance: bigint; // currentAllowance or currentDeposit
  status: AllowanceStatus;
  revokeHandler: () => void; // onWithdraw or onWithdraw
  gasPrice?: bigint;
  estimatedGas: bigint | null;
}) {
  const { address, chain } = useAccount();
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
            disabled
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
        <Dialog isOpen={isOpenedRevokeDialog} setIsOpen={setIsOpenedRevokeDialog}>
          <DialogHeader
            onClose={() => setIsOpenedRevokeDialog(false)}
            title={standard === "ERC-20" ? "Revoke" : "Withdraw"}
          />
          <div className="w-full md:w-[570px] px-4 pb-4 md:px-10 md:pb-10">
            <div className="flex justify-between items-center">
              <div className="flex gap-2 py-2 items-center">
                <span>{`${standard === "ERC-20" ? "Revoke" : "Withdraw"} ${token.symbol}`}</span>
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
                {(currentAllowance === BigInt(0) || status === AllowanceStatus.SUCCESS) && (
                  <Svg className="text-green" iconName="done" size={20} />
                )}
              </div>
            </div>

            <div className="flex justify-between bg-secondary-bg px-5 py-3 rounded-3 text-secondary-text mt-2">
              <span>{formatUnits(currentAllowance || BigInt(0), token.decimals)}</span>
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
            {[AllowanceStatus.INITIAL].includes(status) ? (
              <Button onClick={revokeHandler} fullWidth>
                {standard === "ERC-20" ? "Revoke" : "Withdraw"}
              </Button>
            ) : null}
            {[AllowanceStatus.LOADING, AllowanceStatus.PENDING].includes(status) ? (
              <Button fullWidth disabled>
                <span className="flex items-center gap-2">
                  <Preloader size={20} color="black" />
                </span>
              </Button>
            ) : null}
            {[AllowanceStatus.SUCCESS].includes(status) ? (
              <Button onClick={() => setIsOpenedRevokeDialog(false)} fullWidth>
                Close
              </Button>
            ) : null}
          </div>
        </Dialog>
      )}
    </div>
  );
}

export default function TokenDepositCard({
  token,
  value,
  onChange,
  isDisabled,
  isOutOfRange,
  tokenStandardRatio,
  setTokenStandardRatio,
  gasPrice,
}: {
  token?: Token;
  value: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
  isOutOfRange: boolean;
  tokenStandardRatio: 0 | 100;
  setTokenStandardRatio: (ratio: 0 | 100) => void;
  gasPrice?: bigint;
}) {
  const { chainId } = useAccount();
  // TODO BigInt
  const ERC223Value =
    typeof value !== "undefined" && value !== ""
      ? (parseFloat(value) / 100) * tokenStandardRatio
      : undefined;
  const ERC20Value =
    typeof value !== "undefined" && value !== "" && typeof ERC223Value !== "undefined"
      ? parseFloat(value) - ERC223Value
      : undefined;

  const {
    revokeHandler,
    currentAllowance: currentAllowance,
    revokeStatus,
    revokeEstimatedGas,
  } = useRevoke({
    token,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
  });

  const {
    withdrawHandler,
    currentDeposit: currentDeposit,
    estimatedGas: depositEstimatedGas,
    withdrawStatus,
  } = useWithdraw({
    token,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
  });

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
            revokeHandler={revokeHandler}
            status={revokeStatus}
            estimatedGas={revokeEstimatedGas}
            gasPrice={gasPrice}
          />
          <InputStandardAmount
            standard="ERC-223"
            value={ERC223Value}
            token={token}
            currentAllowance={currentDeposit || BigInt(0)}
            revokeHandler={withdrawHandler}
            estimatedGas={depositEstimatedGas}
            status={withdrawStatus}
            gasPrice={gasPrice}
          />
        </div>
      </div>
    </div>
  );
}
