import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { NumericFormat } from "react-number-format";
import { Address, formatEther, formatGwei, formatUnits, parseUnits } from "viem";
import { useAccount, useBalance, useBlockNumber } from "wagmi";

import Dialog from "@/components/atoms/Dialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import Badge from "@/components/badges/Badge";
import Button, { ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import { formatFloat } from "@/functions/formatFloat";
import { getChainSymbol } from "@/functions/getChainSymbol";
import { AllowanceStatus } from "@/hooks/useAllowance";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import useRevoke from "@/hooks/useRevoke";
import useWithdraw from "@/hooks/useWithdraw";
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/sdk_hybrid/addresses";
import { DexChainId } from "@/sdk_hybrid/chains";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { CurrencyAmount } from "@/sdk_hybrid/entities/fractions/currencyAmount";
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

  const maxHandler = () => {
    if (token) {
      onChange(formatFloat(formatUnits(totalBalance, token.decimals)));
    }
  };

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
          <div className="flex gap-1">
            <span className="text-12 md:text-14">
              {token &&
                `Balance: ${formatFloat(formatUnits(totalBalance, token.decimals))} ${token.symbol}`}
            </span>
            <Button
              variant={ButtonVariant.CONTAINED}
              size={ButtonSize.EXTRA_SMALL}
              className="bg-tertiary-bg text-main-primary xl:px-2 hover:bg-secondary-bg"
              onClick={maxHandler}
            >
              Max
            </Button>
          </div>
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
  value?: string;
  token?: Token;
  currentAllowance: bigint; // currentAllowance or currentDeposit
  status: AllowanceStatus;
  revokeHandler: (customAmount?: bigint) => void; // onWithdraw or onWithdraw
  gasPrice?: bigint;
  estimatedGas: bigint | null;
}) {
  const t = useTranslations("Liquidity");
  const tSwap = useTranslations("Swap");
  const { address } = useAccount();
  const chainId = useCurrentChainId();
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

  const [localValue, setLocalValue] = useState(undefined as undefined | string);
  const localValueBigInt = useMemo(() => {
    if (!token || !localValue) return undefined;
    return parseUnits(localValue, token?.decimals);
  }, [localValue, token]);

  const [isError, setIsError] = useState(false);
  const updateValue = (value: string) => {
    setLocalValue(value);
    const valueBigInt = token ? parseUnits(value, token.decimals) : undefined;
    setIsError(!valueBigInt || valueBigInt <= currentAllowance ? false : true);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span>{t("standard")}</span>
        <Badge color={standard === "ERC-20" ? "purple" : "green"} text={standard} />
        <Tooltip
          iconSize={20}
          text={standard === "ERC-20" ? tSwap("erc20_tooltip") : tSwap("erc223_tooltip")}
        />
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
              t("balance", {
                balance: formatFloat(formatUnits(tokenBalance?.value || BigInt(0), token.decimals)),
                symbol: token.symbol,
              })}
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        {token && (
          <div className="flex items-center gap-1">
            <Tooltip
              iconSize={16}
              text={standard === "ERC-20" ? t("approved_tooltip") : t("deposited_tooltip")}
            />
            <span className="text-12 text-secondary-text">
              {standard === "ERC-20"
                ? t("approved", {
                    approved: formatFloat(
                      formatUnits(currentAllowance || BigInt(0), token.decimals),
                    ),
                    symbol: token.symbol,
                  })
                : t("deposited", {
                    deposited: formatFloat(
                      formatUnits(currentAllowance || BigInt(0), token.decimals),
                    ),
                    symbol: token.symbol,
                  })}
            </span>
          </div>
        )}
        {!!currentAllowance ? (
          <span
            className="text-12 px-2 pt-[1px] pb-[2px] border border-green rounded-3 h-min cursor-pointer hover:text-green duration-200"
            onClick={() => setIsOpenedRevokeDialog(true)}
          >
            {standard === "ERC-20" ? t("revoke") : t("withdraw")}
          </span>
        ) : null}
      </div>
      {token && (
        <Dialog isOpen={isOpenedRevokeDialog} setIsOpen={setIsOpenedRevokeDialog}>
          <DialogHeader
            onClose={() => setIsOpenedRevokeDialog(false)}
            title={standard === "ERC-20" ? t("revoke") : t("withdraw")}
          />
          <div className="w-full md:w-[570px] px-4 pb-4 md:px-10 md:pb-10">
            <div className="flex justify-between items-center">
              <div className="flex gap-2 py-2 items-center">
                <span>{`${standard === "ERC-20" ? t("revoke") : t("withdraw")} ${token.symbol}`}</span>
                <Badge color="green" text={standard} />
              </div>
              <div className="flex items-center gap-2 justify-end">
                {status === AllowanceStatus.PENDING && (
                  <>
                    <Preloader type="linear" />
                    <span className="text-secondary-text text-14">{t("status_pending")}</span>
                  </>
                )}
                {status === AllowanceStatus.LOADING && <Preloader size={20} />}
                {(currentAllowance === BigInt(0) || status === AllowanceStatus.SUCCESS) && (
                  <Svg className="text-green" iconName="done" size={20} />
                )}
              </div>
            </div>

            {standard === "ERC-20" ? (
              <div className="flex justify-between bg-secondary-bg px-5 py-3 rounded-3 text-secondary-text mt-2">
                {/* TODO Input withdraw */}
                <span>{formatUnits(currentAllowance || BigInt(0), token.decimals)}</span>
                <span>{t("amount", { symbol: token.symbol })}</span>
              </div>
            ) : (
              <>
                <div
                  className={clsx(
                    "flex justify-between bg-secondary-bg px-5 py-3 rounded-3 mt-2 border ",
                    isError ? "border-red" : "border-transparent",
                  )}
                >
                  <NumericFormat
                    inputMode="decimal"
                    placeholder="0.0"
                    className={clsx(
                      "bg-transparent text-primary-text outline-0 border-0 w-full peer ",
                    )}
                    type="text"
                    value={
                      typeof localValue === "undefined"
                        ? formatUnits(currentAllowance || BigInt(0), token.decimals)
                        : localValue
                    }
                    onValueChange={(values) => {
                      updateValue(values.value);
                    }}
                    allowNegative={false}
                  />
                  <span className="text-secondary-text min-w-max">
                    {t("amount", { symbol: token.symbol })}
                  </span>
                </div>
                {isError ? (
                  <span className="text-12 mt-2 text-red">{`Must be no more than ${formatUnits(currentAllowance, token.decimals)} ${token.symbol}`}</span>
                ) : null}
              </>
            )}

            <div className="flex justify-between bg-tertiary-bg px-5 py-3 rounded-3 mb-5 mt-2">
              <div className="flex flex-col">
                <span className="text-14 text-secondary-text">{t("gas_price")}</span>
                <span>{gasPrice ? formatFloat(formatGwei(gasPrice)) : ""} GWEI</span>
              </div>
              <div className="flex flex-col">
                <span className="text-14 text-secondary-text">{t("gas_limit")}</span>
                <span>{estimatedGas?.toString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-14 text-secondary-text">{t("fee")}</span>
                <span>{`${gasPrice && estimatedGas ? formatFloat(formatEther(gasPrice * estimatedGas)) : ""} ${getChainSymbol(chainId)}`}</span>
              </div>
            </div>
            {isError ? (
              <Button fullWidth disabled>
                <span className="flex items-center gap-2">Enter correct values</span>
              </Button>
            ) : [AllowanceStatus.INITIAL].includes(status) ? (
              <Button onClick={() => revokeHandler(localValueBigInt)} fullWidth>
                {standard === "ERC-20" ? t("revoke") : t("withdraw")}
              </Button>
            ) : [AllowanceStatus.LOADING, AllowanceStatus.PENDING].includes(status) ? (
              <Button fullWidth disabled>
                <span className="flex items-center gap-2">
                  <Preloader size={20} color="black" />
                </span>
              </Button>
            ) : [AllowanceStatus.SUCCESS].includes(status) ? (
              <Button onClick={() => setIsOpenedRevokeDialog(false)} fullWidth>
                {t("close")}
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
  formattedValue,
  onChange,
  isDisabled,
  isOutOfRange,
  tokenStandardRatio,
  setTokenStandardRatio,
  gasPrice,
}: {
  token?: Token;
  value: CurrencyAmount<Currency> | undefined;
  formattedValue: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
  isOutOfRange: boolean;
  tokenStandardRatio: 0 | 100;
  setTokenStandardRatio: (ratio: 0 | 100) => void;
  gasPrice?: bigint;
}) {
  const t = useTranslations("Liquidity");

  const chainId = useCurrentChainId();
  const valueBigInt = value ? BigInt(value.quotient.toString()) : BigInt(0);

  const ERC223Value = (valueBigInt * BigInt(tokenStandardRatio)) / BigInt(100);
  const ERC20Value = valueBigInt - ERC223Value;

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
        <span className="text-center text-secondary-text">{t("out_of_range")}</span>
      </div>
    );
  }
  if (!token) return;
  return (
    <div className="rounded-3 bg-secondary-bg p-5">
      <div className="flex items-center gap-2 mb-3">
        {token && <Image width={24} height={24} src={token?.logoURI || ""} alt="" />}
        <h3 className="text-16 font-bold">
          {token ? t("token_deposit_amounts", { symbol: token?.symbol }) : t("select_token")}
        </h3>
      </div>
      <div className="flex flex-col gap-5">
        <InputTotalAmount
          token={token}
          value={formattedValue}
          onChange={onChange}
          isDisabled={isDisabled}
        />
        <InputRange value={tokenStandardRatio} onChange={setTokenStandardRatio} />
        <div className="flex flex-col md:flex-row justify-between gap-4 w-full">
          <InputStandardAmount
            standard="ERC-20"
            value={formatUnits(ERC20Value, token.decimals)}
            currentAllowance={currentAllowance || BigInt(0)}
            token={token}
            revokeHandler={revokeHandler}
            status={revokeStatus}
            estimatedGas={revokeEstimatedGas}
            gasPrice={gasPrice}
          />
          <InputStandardAmount
            standard="ERC-223"
            value={formatUnits(ERC223Value, token.decimals)}
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
