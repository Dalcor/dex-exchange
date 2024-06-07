import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useBlock, useBlockNumber, useGasPrice } from "wagmi";

import useAllowance, { AllowanceStatus } from "@/hooks/useAllowance";
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
export type TestApproveTransaction = {
  token: Token;
  amount: bigint;
  isAllowed: boolean;
  status: AllowanceStatus;
  estimatedGas: bigint | null;
};

export enum ApproveTransactionType {
  "ERC20",
  "ERC223",
  "ERC20_AND_ERC223",
}

export const useLiquidityApprove = () => {
  const { chainId } = useAccount();
  const { tokenA, tokenB } = useAddLiquidityTokensStore();
  const { price } = usePriceRange();

  const { tier } = useLiquidityTierStore();

  const { tokenAStandard, tokenBStandard } = useTokensStandards();
  const { parsedAmounts } = useV3DerivedMintInfo({
    tokenA,
    tokenB,
    tier,
    price,
  });

  const amountToCheckA = parsedAmounts[Field.CURRENCY_A]
    ? BigInt(parsedAmounts[Field.CURRENCY_A].quotient.toString())
    : BigInt(0);
  const amountToCheckB = parsedAmounts[Field.CURRENCY_B]
    ? BigInt(parsedAmounts[Field.CURRENCY_B].quotient.toString())
    : BigInt(0);

  const {
    isAllowed: isAllowedA,
    writeTokenApprove: approveA,
    currentAllowance: currentAllowanceA,
    estimatedGas: estimatedGasAllowanceA,
    status: statusAllowanceA,
  } = useAllowance({
    token: tokenA,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
    amountToCheck: amountToCheckA,
  });

  const {
    isAllowed: isAllowedB,
    writeTokenApprove: approveB,
    currentAllowance: currentAllowanceB,
    estimatedGas: estimatedGasAllowanceB,
    status: statusAllowanceB,
  } = useAllowance({
    token: tokenB,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
    amountToCheck: amountToCheckB,
  });

  const {
    isDeposited: isDepositedA,
    writeTokenDeposit: depositA,
    currentDeposit: currentDepositA,
    status: statusDepositA,
    estimatedGas: estimatedGasDepositA,
  } = useDeposit({
    token: tokenA,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
    amountToCheck: amountToCheckA,
  });
  const {
    isDeposited: isDepositedB,
    writeTokenDeposit: depositB,
    currentDeposit: currentDepositB,
    status: statusDepositB,
    estimatedGas: estimatedGasDepositB,
  } = useDeposit({
    token: tokenB,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
    amountToCheck: amountToCheckB,
  });

  const testTransactions = useMemo(() => {
    let approveA = undefined as undefined | TestApproveTransaction;
    let approveB = undefined as undefined | TestApproveTransaction;
    let depositA = undefined as undefined | TestApproveTransaction;
    let depositB = undefined as undefined | TestApproveTransaction;
    if (tokenA && tokenAStandard && amountToCheckA) {
      if (tokenAStandard === "ERC-20") {
        approveA = {
          token: tokenA,
          amount: amountToCheckA,
          isAllowed: isAllowedA,
          status: statusAllowanceA,
          estimatedGas: estimatedGasAllowanceA,
        };
      } else if (tokenAStandard === "ERC-223") {
        depositA = {
          token: tokenA,
          amount: amountToCheckA,
          isAllowed: isDepositedA,
          status: statusDepositA,
          estimatedGas: estimatedGasDepositA,
        };
      }
    }
    if (tokenB && tokenBStandard && amountToCheckB) {
      if (tokenBStandard === "ERC-20") {
        approveB = {
          token: tokenB,
          amount: amountToCheckB,
          isAllowed: isAllowedB,
          status: statusAllowanceB,
          estimatedGas: estimatedGasAllowanceB,
        };
      } else if (tokenBStandard === "ERC-223") {
        depositB = {
          token: tokenB,
          amount: amountToCheckB,
          isAllowed: isDepositedB,
          status: statusDepositB,
          estimatedGas: estimatedGasDepositB,
        };
      }
    }

    return {
      approveA,
      approveB,
      depositA,
      depositB,
    };
  }, [
    tokenA,
    tokenB,
    tokenAStandard,
    tokenBStandard,
    amountToCheckA,
    amountToCheckB,
    estimatedGasAllowanceA,
    estimatedGasAllowanceB,
    isAllowedA,
    isAllowedB,
    statusAllowanceA,
    statusAllowanceB,
    statusDepositA,
    statusDepositB,
    estimatedGasDepositA,
    estimatedGasDepositB,
    isDepositedA,
    isDepositedB,
  ]);

  const [approveTransactions, setApproveTransactions] = useState([] as ApproveTransaction[]);

  useEffect(() => {
    let transactions: ApproveTransaction[] = [];
    if (tokenA && tokenAStandard && amountToCheckA) {
      if (
        (tokenAStandard === "ERC-20" && (currentAllowanceA || BigInt(0)) < amountToCheckA) ||
        (tokenAStandard === "ERC-223" && (currentDepositA || BigInt(0)) < amountToCheckA)
      ) {
        transactions.push({
          token: tokenA,
          standard: tokenAStandard,
          amount: amountToCheckA,
          estimatedGas: estimatedGasAllowanceA,
        });
      }
    }
    if (tokenB && tokenBStandard && amountToCheckB) {
      if (
        (tokenBStandard === "ERC-20" && (currentAllowanceB || BigInt(0)) < amountToCheckB) ||
        (tokenBStandard === "ERC-223" && (currentDepositB || BigInt(0)) < amountToCheckB)
      ) {
        transactions.push({
          token: tokenB,
          standard: tokenBStandard,
          amount: amountToCheckB,
          estimatedGas: estimatedGasAllowanceB,
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
    estimatedGasAllowanceA,
    estimatedGasAllowanceB,
  ]);

  const handleApprove = useCallback(async () => {
    if (tokenAStandard === "ERC-20" && (currentAllowanceA || BigInt(0)) < amountToCheckA) {
      approveA();
    } else if (tokenAStandard === "ERC-223" && (currentDepositA || BigInt(0)) < amountToCheckA) {
      depositA();
    }
    if (tokenBStandard === "ERC-20" && (currentAllowanceB || BigInt(0)) < amountToCheckB) {
      approveB();
    } else if (tokenBStandard === "ERC-223" && (currentDepositB || BigInt(0)) < amountToCheckB) {
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
    const isERC20Transaction = testTransactions.approveA || testTransactions.approveB;
    const isERC223Transaction = testTransactions.depositA || testTransactions.depositB;
    if (isERC20Transaction && isERC223Transaction) {
      return ApproveTransactionType.ERC20_AND_ERC223;
    } else if (isERC20Transaction) {
      return ApproveTransactionType.ERC20;
    } else {
      return ApproveTransactionType.ERC223;
    }
  }, [testTransactions]);

  // Gas price
  const { data: gasPrice, refetch: refetchGasPrice } = useGasPrice();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  useEffect(() => {
    refetchGasPrice();
  }, [blockNumber, refetchGasPrice]);

  return {
    approveTransactions,
    testTransactions,
    handleApprove,
    approveTransactionsType,
    gasPrice,
  };
};
