import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { Address, formatEther, formatGwei } from "viem";
import { useBlockNumber, useGasPrice } from "wagmi";

import PositionPriceRangeCard from "@/app/[locale]/pool/[tokenId]/components/PositionPriceRangeCard";
import Alert from "@/components/atoms/Alert";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Badge from "@/components/badges/Badge";
import RangeBadge, { PositionRangeStatus } from "@/components/badges/RangeBadge";
import Button from "@/components/buttons/Button";
import IconButton from "@/components/buttons/IconButton";
import { FEE_AMOUNT_DETAIL } from "@/config/constants/liquidityFee";
import { formatFloat } from "@/functions/formatFloat";
import { getChainSymbol } from "@/functions/getChainSymbol";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import { AllowanceStatus } from "@/hooks/useAllowance";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { usePositionPrices, usePositionRangeStatus } from "@/hooks/usePositions";
import { Link } from "@/navigation";
import { DexChainId } from "@/sdk_hybrid/chains";
import { Standard } from "@/sdk_hybrid/standard";
import { EstimatedGasId, useEstimatedGasStoreById } from "@/stores/useEstimatedGasStore";

import { useAddLiquidity, useAddLiquidityEstimatedGas } from "../../hooks/useAddLiquidity";
import {
  ApproveTransaction,
  ApproveTransactionType,
  useLiquidityApprove,
} from "../../hooks/useLiquidityApprove";
import { usePriceRange } from "../../hooks/usePrice";
import { useV3DerivedMintInfo } from "../../hooks/useV3DerivedMintInfo";
import { Field, useTokensStandards } from "../../stores/useAddLiquidityAmountsStore";
import { useAddLiquidityTokensStore } from "../../stores/useAddLiquidityTokensStore";
import { useConfirmLiquidityDialogStore } from "../../stores/useConfirmLiquidityDialogOpened";
import { LiquidityStatus, useLiquidityStatusStore } from "../../stores/useLiquidityStatusStore";
import { useLiquidityTierStore } from "../../stores/useLiquidityTierStore";
import { TransactionItem } from "./TransactionItem";

const APPROVE_BUTTON_TEXT = {
  [ApproveTransactionType.ERC20_AND_ERC223]: "button_approve_and_deposit",
  [ApproveTransactionType.ERC20]: "button_approve",
  [ApproveTransactionType.ERC223]: "button_deposit",
};

interface TransactionItem {
  transaction: ApproveTransaction;
  standard: Standard;
}

function isDefinedTransactionItem(item: {
  transaction?: ApproveTransaction;
  standard: Standard;
}): item is TransactionItem {
  return !!item.transaction;
}

const ApproveDialog = () => {
  const t = useTranslations("Liquidity");

  const { isOpen, setIsOpen } = useConfirmLiquidityDialogStore();
  const { status, setStatus } = useLiquidityStatusStore();

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
      standard: Standard.ERC20,
      token: "tokenA" as TokenType,
    },
    {
      transaction: approveTransactions.depositA,
      standard: Standard.ERC223,
      token: "tokenA" as TokenType,
    },
    {
      transaction: approveTransactions.approveB,
      standard: Standard.ERC20,
      token: "tokenB" as TokenType,
    },
    {
      transaction: approveTransactions.depositB,
      standard: Standard.ERC223,
      token: "tokenB" as TokenType,
    },
  ].filter(isDefinedTransactionItem);

  const isAllowed = transactionItems
    .map(({ transaction }) => !!transaction?.isAllowed)
    .every(Boolean);

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
    <>
      <DialogHeader
        onClose={() => {
          // if (isSettledSwap) {
          //   resetAmounts();
          //   resetTokens();
          // }
          setIsOpen(false);
        }}
        title={`${t(APPROVE_BUTTON_TEXT[approveTransactionsType] as any)} ${t("approve_transaction_modal_title")}`}
      />
      <div className="w-full md:w-[570px] px-4 md:px-10 md:pb-10 pb-4 mx-auto">
        {transactionItems.map(
          (
            { transaction, standard, token }: { transaction: any; standard: any; token: TokenType },
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
        {approveTotalGasLimit > 0 ? (
          <div className="flex gap-1 justify-center items-center border-t pt-4 border-secondary-border mb-4">
            <span className="text-secondary-text">{t("total_fee")}</span>
            <span className="font-bold">{`${gasPrice && approveTotalGasLimit ? formatFloat(formatEther(gasPrice * approveTotalGasLimit)) : ""} ${chainSymbol}`}</span>
          </div>
        ) : null}

        {isFormInvalid ? (
          <Button fullWidth disabled>
            <span className="flex items-center gap-2">Enter correct values</span>
          </Button>
        ) : isLoading ? (
          <Button fullWidth disabled>
            <span className="flex items-center gap-2">
              <Preloader size={20} color="green" />
            </span>
          </Button>
        ) : isAllowed ? (
          <Button
            onClick={() => {
              setStatus(LiquidityStatus.MINT);
            }}
            fullWidth
          >
            Preview liquidity
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
    </>
  );
};

const MintDialog = ({ increase = false, tokenId }: { increase?: boolean; tokenId?: string }) => {
  const { setIsOpen } = useConfirmLiquidityDialogStore();
  const chainId = useCurrentChainId();
  const { tokenA, tokenB } = useAddLiquidityTokensStore();
  const { tier } = useLiquidityTierStore();
  const { price } = usePriceRange();
  const { tokenAStandard, tokenBStandard } = useTokensStandards();
  const [showFirst, setShowFirst] = useState(true);

  const { parsedAmounts, position, noLiquidity } = useV3DerivedMintInfo({
    tokenA,
    tokenB,
    tier,
    price,
  });

  // Gas price
  const { data: gasPrice, refetch: refetchGasPrice } = useGasPrice();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  useEffect(() => {
    refetchGasPrice();
  }, [blockNumber, refetchGasPrice]);

  const buttonText = increase
    ? "Add liquidity"
    : noLiquidity
      ? "Create Pool & Mint liquidity"
      : "Mint liquidity";
  const { inRange, removed } = usePositionRangeStatus({ position });

  const { minPriceString, maxPriceString, currentPriceString, ratio } = usePositionPrices({
    position,
    showFirst,
  });

  const { handleAddLiquidity, status } = useAddLiquidity({
    position,
    increase,
    createPool: noLiquidity ? true : false,
    tokenId,
  });

  useAddLiquidityEstimatedGas({
    position,
    increase,
    createPool: noLiquidity ? true : false,
    tokenId,
  });

  const estimatedMintGas = useEstimatedGasStoreById(EstimatedGasId.mint);

  if (!tokenA || !tokenB) {
    return null;
  }

  return (
    <>
      <DialogHeader onClose={() => setIsOpen(false)} title="Add liquidity" />
      <div className="px-4 md:px-10 pb-4 md:pb-10 h-[80dvh] md:h-auto overflow-y-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center relative w-12 h-[34px]">
              <Image
                className="absolute left-0 top-0"
                width={32}
                height={32}
                src={tokenA.logoURI as any}
                alt=""
              />
              <div className="w-[34px] h-[34px] flex absolute right-0 top-0 bg-tertiary-bg rounded-full items-center justify-center">
                <Image width={32} height={32} src={tokenB.logoURI as any} alt="" />
              </div>
            </div>
            <span className="text-18 font-bold">{`${tokenA.symbol} / ${tokenB.symbol}`}</span>
            <RangeBadge
              status={inRange ? PositionRangeStatus.IN_RANGE : PositionRangeStatus.OUT_OF_RANGE}
            />
          </div>
          <div className="flex items-center gap-2 justify-end">
            {status === AllowanceStatus.PENDING && (
              <>
                <Preloader type="linear" />
                <span className="text-secondary-text text-14">Proceed in your wallet</span>
              </>
            )}
            {status === AllowanceStatus.LOADING && <Preloader size={20} />}
            {status === AllowanceStatus.SUCCESS && (
              <Svg className="text-green" iconName="done" size={20} />
            )}
          </div>
        </div>
        {/* Amounts */}
        <div className="flex flex-col rounded-3 bg-tertiary-bg p-5 mt-4">
          <div className="flex gap-3">
            <div className="flex flex-col items-center w-full rounded-3 bg-quaternary-bg px-5 py-3">
              <div className="flex items-center gap-2">
                <Image width={24} height={24} src={tokenA.logoURI as any} alt="" />
                <span>{tokenA.symbol}</span>
                <Badge color="green" text={tokenAStandard} />
              </div>
              <span className="text-16 font-medium">
                {formatFloat(parsedAmounts[Field.CURRENCY_A]?.toSignificant() || "")}
              </span>
            </div>
            <div className="flex flex-col items-center w-full rounded-3 bg-quaternary-bg px-5 py-3">
              <div className="flex items-center gap-2">
                <Image width={24} height={24} src={tokenB.logoURI as any} alt="" />
                <span>{tokenB.symbol}</span>
                <Badge color="green" text={tokenBStandard} />
              </div>
              <span className="text-16 font-medium">
                {formatFloat(parsedAmounts[Field.CURRENCY_B]?.toSignificant() || "")}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="font-bold">Fee Tier</span>
            <span>{`${FEE_AMOUNT_DETAIL[tier].label}%`}</span>
          </div>
        </div>
        {/* Price range */}
        <div>
          <div className="flex justify-between items-center mb-3 mt-5">
            <span className="font-bold text-secondary-text">Selected Range</span>
            <div className="flex gap-0.5 bg-secondary-bg rounded-2 p-0.5">
              <button
                onClick={() => setShowFirst(true)}
                className={clsx(
                  "text-12 h-7 rounded-1 min-w-[60px] px-3 border duration-200",
                  showFirst
                    ? "bg-green-bg border-green text-primary-text"
                    : "hover:bg-green-bg bg-primary-bg border-transparent text-secondary-text",
                )}
              >
                {tokenA?.symbol}
              </button>
              <button
                onClick={() => setShowFirst(false)}
                className={clsx(
                  "text-12 h-7 rounded-1 min-w-[60px] px-3 border duration-200",
                  !showFirst
                    ? "bg-green-bg border-green text-primary-text"
                    : "hover:bg-green-bg bg-primary-bg border-transparent text-secondary-text",
                )}
              >
                {tokenB?.symbol}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-[1fr_20px_1fr] mb-3">
            <PositionPriceRangeCard
              showFirst={showFirst}
              tokenA={tokenA}
              tokenB={tokenB}
              price={minPriceString}
            />
            <div className="relative">
              <div className="bg-primary-bg w-12 h-12 rounded-full text-placeholder-text absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <Svg iconName="double-arrow" />
              </div>
            </div>
            <PositionPriceRangeCard
              showFirst={showFirst}
              tokenA={tokenA}
              tokenB={tokenB}
              price={maxPriceString}
              isMax
            />
          </div>
          <div className="rounded-3 overflow-hidden">
            <div className="bg-tertiary-bg flex items-center justify-center flex-col py-3">
              <div className="text-14 text-secondary-text">Current price</div>
              <div className="text-18">{currentPriceString}</div>
              <div className="text-14 text-secondary-text">
                {showFirst
                  ? `${tokenB?.symbol} per ${tokenA?.symbol}`
                  : `${tokenA?.symbol} per ${tokenB?.symbol}`}
              </div>
            </div>
          </div>
        </div>

        {/* GAS */}
        <div className="flex justify-between bg-tertiary-bg px-5 py-3 rounded-3 mb-5 mt-5">
          <div className="flex flex-col">
            <span className="text-14 text-secondary-text">Gas price</span>
            <span>{gasPrice ? formatFloat(formatGwei(gasPrice)) : ""} GWEI</span>
          </div>
          <div className="flex flex-col">
            <span className="text-14 text-secondary-text">Gas limit</span>
            <span>{estimatedMintGas?.toString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-14 text-secondary-text">Fee</span>
            <span>{`${gasPrice && formatFloat(formatEther(gasPrice * estimatedMintGas))} ${getChainSymbol(chainId)}`}</span>
          </div>
        </div>

        {[AllowanceStatus.LOADING, AllowanceStatus.PENDING].includes(status) ? (
          <Button fullWidth disabled>
            <span className="flex items-center gap-2">
              <Preloader size={20} color="green" />
            </span>
          </Button>
        ) : (
          <Button
            onClick={() => {
              handleAddLiquidity();
            }}
            fullWidth
          >
            {buttonText}
          </Button>
        )}
      </div>
    </>
  );
};

function ApproveRow({
  logoURI = "",
  isPending = false,
  isLoading = false,
  isSuccess = false,
  isReverted = false,
  hash,
}: {
  logoURI: string | undefined;
  isLoading?: boolean;
  isPending?: boolean;
  isSuccess?: boolean;
  isReverted?: boolean;
  hash?: Address | undefined;
}) {
  const t = useTranslations("Swap");

  return (
    <div
      className={clsx(
        "grid grid-cols-[32px_1fr_1fr] gap-2 h-10 before:absolute relative before:left-[15px] before:-bottom-4 before:w-0.5 before:h-3 before:rounded-1",
        isSuccess ? "before:bg-green" : "before:bg-green-bg",
      )}
    >
      <div className="flex items-center">
        <Image
          className={clsx(isSuccess && "", "rounded-full")}
          src={logoURI}
          alt=""
          width={32}
          height={32}
        />
      </div>

      <div className="flex flex-col justify-center">
        <span className={isSuccess ? "text-secondary-text text-14" : "text-14"}>
          {isSuccess && t("approved")}
          {isPending && "Confirm in your wallet"}
          {isLoading && "Approving"}
          {!isSuccess && !isPending && !isReverted && !isLoading && "Approve"}
          {isReverted && "Approve failed"}
        </span>
        {!isSuccess && <span className="text-green text-12">{t("why_do_i_have_to_approve")}</span>}
      </div>
      <div className="flex items-center gap-2 justify-end">
        {hash && (
          <a
            target="_blank"
            href={getExplorerLink(ExplorerLinkType.TRANSACTION, hash, DexChainId.SEPOLIA)}
          >
            <IconButton iconName="forward" />
          </a>
        )}
        {isPending && (
          <>
            <Preloader type="linear" />
            <span className="text-secondary-text text-14">{t("proceed_in_your_wallet")}</span>
          </>
        )}
        {isLoading && <Preloader size={20} />}
        {isSuccess && <Svg className="text-green" iconName="done" size={20} />}
        {isReverted && <Svg className="text-red-input" iconName="warning" size={20} />}
      </div>
    </div>
  );
}

const SuccessfulDialog = ({ isError = false }: { isError?: boolean }) => {
  const { isOpen, setIsOpen } = useConfirmLiquidityDialogStore();
  const { tokenA, tokenB } = useAddLiquidityTokensStore();
  const { tier } = useLiquidityTierStore();
  const { price } = usePriceRange();
  const { liquidityHash } = useLiquidityStatusStore();
  const { parsedAmounts } = useV3DerivedMintInfo({
    tokenA,
    tokenB,
    tier,
    price,
  });

  return (
    <>
      <DialogHeader onClose={() => setIsOpen(false)} title="Add liquidity" />
      <div className="px-4 md:px-10 pb-4 md:pb-10 h-[80dvh] md:h-auto overflow-y-auto">
        <div className="mx-auto w-[80px] h-[80px] flex items-center justify-center relative mb-5">
          {isError ? (
            <EmptyStateIcon iconName="warning" />
          ) : (
            <>
              <div className="w-[54px] h-[54px] rounded-full border-[7px] blur-[8px] opacity-80 border-green" />
              <Svg
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green"
                iconName={"success"}
                size={65}
              />
            </>
          )}
        </div>

        <div className="flex justify-center">
          <span
            className={clsx(
              "text-20 font-bold mb-1",
              isError ? "text-red-input" : "text-primary-text",
            )}
          >
            {isError ? "Failed to add liquidity" : "Liquidity added successfully"}
          </span>
        </div>

        <div className="flex justify-center gap-2 items-center mb-3">
          <Image src={tokenA?.logoURI || ""} alt="" width={24} height={24} />
          <span>
            {formatFloat(parsedAmounts[Field.CURRENCY_A]?.toSignificant() || "")} {tokenA?.symbol}
          </span>
          <Svg iconName="add" />
          <Image src={tokenB?.logoURI || ""} alt="" width={24} height={24} />
          <span>
            {formatFloat(parsedAmounts[Field.CURRENCY_B]?.toSignificant() || "")} {tokenB?.symbol}
          </span>
        </div>
        {isError ? null : (
          <Link href="/pools/my-positions">
            <div className="flex gap-2 text-green justify-center">
              View my liquidity positions
              <Svg iconName="forward" />
            </div>
          </Link>
        )}
        <div className="h-px w-full bg-secondary-border mb-4 mt-5" />
        {/* <ApproveRow /> */}
        {/* LIQUIDITY ROW */}
        <div className="grid grid-cols-[32px_1fr_1fr] gap-2 h-10">
          <div className="flex items-center h-full">
            <div
              className={clsx(
                "p-1 rounded-full h-8 w-8",
                isError ? "bg-red-bg text-red-input" : "bg-green text-secondary-bg",
              )}
            >
              <Svg className="" iconName="add" />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-14 font-medium text-primary-text">
              {isError ? "Failed to add liquidity" : "Liquidity added "}
            </span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            {liquidityHash && (
              <a
                target="_blank"
                href={getExplorerLink(
                  ExplorerLinkType.TRANSACTION,
                  liquidityHash,
                  DexChainId.SEPOLIA,
                )}
              >
                <IconButton iconName="forward" />
              </a>
            )}
            {isError ? (
              <Svg className="text-red-input" iconName="warning" size={24} />
            ) : (
              <Svg className="text-green" iconName="done" size={24} />
            )}
          </div>
        </div>
        {isError ? (
          <div className="flex flex-col gap-5 mt-4">
            <Alert
              withIcon={false}
              type="error"
              text={
                <span>
                  Transaction failed due to lack of gas or an internal contract error. Try using
                  higher slippage or gas to ensure your transaction is completed. If you still have
                  issues, click{" "}
                  <a href="#" className="text-green hover:underline">
                    common errors
                  </a>
                  .
                </span>
              }
            />
            <Button
              fullWidth
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Try again
            </Button>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default function ConfirmLiquidityDialog({
  increase = false,
  tokenId,
}: {
  increase?: boolean;
  tokenId?: string;
}) {
  const { isOpen, setIsOpen } = useConfirmLiquidityDialogStore();

  const { status } = useLiquidityStatusStore();
  return (
    <DrawerDialog
      isOpen={isOpen}
      setIsOpen={(isOpen) => {
        setIsOpen(isOpen);
      }}
    >
      <div className="shadow-popup bg-primary-bg rounded-5 w-full md:w-[600px]">
        {[
          LiquidityStatus.INITIAL,
          LiquidityStatus.APPROVE_PENDING,
          LiquidityStatus.APPROVE_LOADING,
        ].includes(status) ? (
          <ApproveDialog />
        ) : null}
        {[
          LiquidityStatus.MINT,
          LiquidityStatus.MINT_PENDING,
          LiquidityStatus.MINT_LOADING,
        ].includes(status) ? (
          <MintDialog increase={increase} tokenId={tokenId} />
        ) : null}
        {[LiquidityStatus.SUCCESS].includes(status) ? <SuccessfulDialog /> : null}
        {[LiquidityStatus.MINT_ERROR].includes(status) ? <SuccessfulDialog isError /> : null}
      </div>
    </DrawerDialog>
  );
}
