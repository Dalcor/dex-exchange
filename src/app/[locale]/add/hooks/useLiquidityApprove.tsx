import { useCallback, useEffect, useMemo } from "react";
import { useBlockNumber, useGasPrice } from "wagmi";

import useAllowance, { AllowanceStatus } from "@/hooks/useAllowance";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import useDeposit from "@/hooks/useDeposit";
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/sdk_hybrid/addresses";
import { DexChainId } from "@/sdk_hybrid/chains";
import { Token } from "@/sdk_hybrid/entities/token";

import { Field, useTokensStandards } from "../stores/useAddLiquidityAmountsStore";
import { useAddLiquidityTokensStore } from "../stores/useAddLiquidityTokensStore";
import { useLiquidityTierStore } from "../stores/useLiquidityTierStore";
import { usePriceRange } from "./usePrice";
import { useV3DerivedMintInfo } from "./useV3DerivedMintInfo";

// TestApproveTransaction
export type ApproveTransaction = {
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
  const chainId = useCurrentChainId();
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

  const approveTransactions = useMemo(() => {
    let approveA = undefined as undefined | ApproveTransaction;
    let approveB = undefined as undefined | ApproveTransaction;
    let depositA = undefined as undefined | ApproveTransaction;
    let depositB = undefined as undefined | ApproveTransaction;
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

  const handleApprove = useCallback(
    async ({
      customAmountA,
      customAmountB,
    }: {
      customAmountA?: bigint;
      customAmountB?: bigint;
    }) => {
      const amountA = customAmountA || amountToCheckA;
      const amountB = customAmountB || amountToCheckB;
      if (tokenAStandard === "ERC-20" && (currentAllowanceA || BigInt(0)) < amountA) {
        approveA(customAmountA);
      } else if (tokenAStandard === "ERC-223" && (currentDepositA || BigInt(0)) < amountA) {
        depositA(customAmountA);
      }
      if (tokenBStandard === "ERC-20" && (currentAllowanceB || BigInt(0)) < amountB) {
        approveB(customAmountB);
      } else if (tokenBStandard === "ERC-223" && (currentDepositB || BigInt(0)) < amountB) {
        depositB(customAmountB);
      }
    },
    [
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
    ],
  );

  const approveTransactionsType = useMemo(() => {
    const isERC20Transaction = approveTransactions.approveA || approveTransactions.approveB;
    const isERC223Transaction = approveTransactions.depositA || approveTransactions.depositB;
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
  const { data: blockNumber } = useBlockNumber({ watch: true });

  useEffect(() => {
    refetchGasPrice();
  }, [blockNumber, refetchGasPrice]);

  const { approveTransactionsCount, approveTotalGasLimit } = useMemo(() => {
    const approveTransactionsArray = Object.values(approveTransactions).filter(
      (t) => !!t && !t.isAllowed,
    ) as ApproveTransaction[];

    const transactionsCount = approveTransactionsArray.length;
    const totalGasLimit = approveTransactionsArray.reduce((acc, { estimatedGas }) => {
      return estimatedGas ? acc + estimatedGas : acc;
    }, BigInt(0));

    return { approveTransactionsCount: transactionsCount, approveTotalGasLimit: totalGasLimit };
  }, [approveTransactions]);

  return {
    approveTransactions,
    approveTransactionsCount,
    handleApprove,
    approveTransactionsType,
    gasPrice,
    approveTotalGasLimit,
  };
};
