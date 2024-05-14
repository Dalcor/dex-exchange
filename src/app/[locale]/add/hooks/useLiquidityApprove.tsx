import { useCallback, useEffect, useMemo, useState } from "react";
import { parseUnits } from "viem";
import { useAccount, useBlock, useGasPrice } from "wagmi";

import useAllowance from "@/hooks/useAllowance";
import useDeposit from "@/hooks/useDeposit";
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/sdk_hybrid/addresses";
import { DexChainId } from "@/sdk_hybrid/chains";
import { Token, TokenStandard } from "@/sdk_hybrid/entities/token";

import { Field, useTokensStandards } from "../stores/useAddLiquidityAmountsStore";
import { useAddLiquidityTokensStore } from "../stores/useAddLiquidityTokensStore";
import { useLiquidityTierStore } from "../stores/useLiquidityTierStore";
import { useV3DerivedMintInfo } from "./useAddLiquidity";
import { usePriceRange } from "./usePrice";

export type ApproveTransaction = {
  token: Token;
  standard: TokenStandard;
  amount: bigint;
  estimatedGas: bigint | null;
};

export enum ApproveTransactionType {
  "ERC20",
  "ERC223",
  "ERC20_AND_ERC223",
}

export const useLiquidityApprove = () => {
  const { chainId } = useAccount();
  const { tokenA, tokenB, setTokenA, setTokenB } = useAddLiquidityTokensStore();
  const {
    formattedPrice,
    invertPrice,
    price,
    pricesAtTicks,
    ticksAtLimit,
    isFullRange,
    isSorted,
    leftPrice,
    rightPrice,
    token0,
    token1,
    tickSpaceLimits,
  } = usePriceRange();

  const { tier, setTier } = useLiquidityTierStore();

  const { tokenAStandard, tokenBStandard } = useTokensStandards();
  const {
    parsedAmounts,
    position,
    currencies,
    noLiquidity,
    outOfRange,
    depositADisabled,
    depositBDisabled,
  } = useV3DerivedMintInfo({
    tokenA,
    tokenB,
    tier,
    price,
  });

  const amountToCheckA = parseUnits(
    parsedAmounts[Field.CURRENCY_A]?.toSignificant() || "",
    tokenA?.decimals || 18,
  );

  const amountToCheckB = parseUnits(
    parsedAmounts[Field.CURRENCY_B]?.toSignificant() || "",
    tokenB?.decimals || 18,
  );

  const {
    isAllowed: isAllowedA,
    writeTokenApprove: approveA,
    writeTokenRevoke: revokeA,
    isLoading: isApprovingA,
    currentAllowance: currentAllowanceA,
    isRevoking: isRevokingA,
    estimatedGas: estimatedGasAllowanceA,
  } = useAllowance({
    token: tokenA,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
    // TODO: mb better way to convert CurrencyAmount to bigint
    amountToCheck: amountToCheckA,
  });

  const {
    isAllowed: isAllowedB,
    writeTokenApprove: approveB,
    writeTokenRevoke: revokeB,
    isLoading: isApprovingB,
    currentAllowance: currentAllowanceB,
    isRevoking: isRevokingB,
    estimatedGas: estimatedGasAllowanceB,
  } = useAllowance({
    token: tokenB,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
    // TODO: mb better way to convert CurrencyAmount to bigint
    amountToCheck: amountToCheckB,
  });

  const {
    isDeposited: isDepositedA,
    writeTokenDeposit: depositA,
    writeTokenWithdraw: withdrawA,
    isDepositing: isDepositingA,
    currentDeposit: currentDepositA,
    isWithdrawing: isWithdrawingA,
  } = useDeposit({
    token: tokenA,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
    // TODO: mb better way to convert CurrencyAmount to bigint
    amountToCheck: amountToCheckA,
  });
  const {
    isDeposited: isDepositedB,
    writeTokenDeposit: depositB,
    writeTokenWithdraw: withdrawB,
    isDepositing: isDepositingB,
    currentDeposit: currentDepositB,
    isWithdrawing: isWithdrawingB,
  } = useDeposit({
    token: tokenB,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
    // TODO: mb better way to convert CurrencyAmount to bigint
    amountToCheck: amountToCheckB,
  });

  const estimatedGasA = estimatedGasAllowanceA;
  const estimatedGasB = estimatedGasAllowanceB;

  const [approveTransactions, setApproveTransactions] = useState([] as ApproveTransaction[]);

  useEffect(() => {
    let transactions: ApproveTransaction[] = [];
    if (tokenA && tokenAStandard && amountToCheckA) {
      if (
        (tokenAStandard === "ERC-20" && (currentAllowanceA || BigInt(0)) < amountToCheckA) ||
        (tokenAStandard === "ERC-223" && currentDepositA && currentDepositA < amountToCheckA)
      ) {
        transactions.push({
          token: tokenA,
          standard: tokenAStandard,
          amount: amountToCheckA,
          estimatedGas: estimatedGasA,
        });
      }
    }
    if (tokenB && tokenBStandard && amountToCheckB) {
      if (
        (tokenBStandard === "ERC-20" && (currentAllowanceB || BigInt(0)) < amountToCheckB) ||
        (tokenBStandard === "ERC-223" && currentDepositB && currentDepositB < amountToCheckB)
      ) {
        transactions.push({
          token: tokenB,
          standard: tokenBStandard,
          amount: amountToCheckB,
          estimatedGas: estimatedGasB,
        });
      }
    }

    setApproveTransactions(transactions);
  }, [
    tokenA,
    tokenB,
    tokenAStandard,
    tokenBStandard,
    amountToCheckA,
    amountToCheckB,
    currentAllowanceA,
    currentAllowanceB,
    currentDepositA,
    currentDepositB,
    estimatedGasA,
    estimatedGasB,
  ]);

  const handleApprove = useCallback(async () => {
    console.log("🚀 ~ handleApprove ~ handleApprove:");
    if (tokenAStandard === "ERC-20" && (currentAllowanceA || BigInt(0)) < amountToCheckA) {
      approveA();
    } else if (
      tokenAStandard === "ERC-223" &&
      currentDepositA &&
      currentDepositA < amountToCheckA
    ) {
      depositA();
    }
    if (tokenBStandard === "ERC-20" && (currentAllowanceB || BigInt(0)) < amountToCheckB) {
      approveB();
    } else if (
      tokenBStandard === "ERC-223" &&
      currentDepositB &&
      currentDepositB < amountToCheckB
    ) {
      depositB();
    }
  }, [
    approveA,
    approveB,
    depositA,
    depositB,
    tokenAStandard,
    tokenBStandard,
    currentAllowanceA,
    currentAllowanceB,
    currentDepositA,
    currentDepositB,
    amountToCheckA,
    amountToCheckB,
    // estimatedGasA,
    // estimatedGasB,
  ]);

  const approveTransactionsType = useMemo(() => {
    const isERC20Transaction = approveTransactions.map((t) => t.standard).includes("ERC-20");
    const isERC223Transaction = approveTransactions.map((t) => t.standard).includes("ERC-223");
    if (isERC20Transaction && isERC223Transaction) {
      return ApproveTransactionType.ERC20_AND_ERC223;
    } else if (isERC20Transaction) {
      return ApproveTransactionType.ERC20;
    } else {
      return ApproveTransactionType.ERC223;
    }
  }, [approveTransactions]);

  // Gas price
  const { data: gasPrice, refetch: refetchGasPrice } = useGasPrice();
  const { data: block } = useBlock({ watch: true, blockTag: "latest" });

  useEffect(() => {
    refetchGasPrice();
  }, [block, refetchGasPrice]);

  return {
    approveTransactions,
    handleApprove,
    approveTransactionsType,
    gasPrice,
  };
};
