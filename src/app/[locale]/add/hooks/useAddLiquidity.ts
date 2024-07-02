import JSBI from "jsbi";
import { useCallback, useMemo, useState } from "react";
import { Abi, Address, encodeFunctionData, formatUnits, getAbiItem, parseUnits } from "viem";
import { useAccount, useBlockNumber, usePublicClient, useWalletClient } from "wagmi";

import { useAddLiquidityTokensStore } from "@/app/[locale]/add/stores/useAddLiquidityTokensStore";
import { NONFUNGIBLE_POSITION_MANAGER_ABI } from "@/config/abis/nonfungiblePositionManager";
import { formatFloat } from "@/functions/formatFloat";
import { IIFE } from "@/functions/iife";
import { AllowanceStatus } from "@/hooks/useAllowance";
import useDeepEffect from "@/hooks/useDeepEffect";
import useTransactionDeadline from "@/hooks/useTransactionDeadline";
import addToast from "@/other/toast";
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/sdk_hybrid/addresses";
import { DexChainId } from "@/sdk_hybrid/chains";
import { FeeAmount } from "@/sdk_hybrid/constants";
import { Percent } from "@/sdk_hybrid/entities/fractions/percent";
import { Position } from "@/sdk_hybrid/entities/position";
import { toHex } from "@/sdk_hybrid/utils/calldata";
import { EstimatedGasId, useEstimatedGasStore } from "@/stores/useEstimatedGasStore";
import {
  GasFeeModel,
  RecentTransactionTitleTemplate,
  stringifyObject,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";
import { useTransactionSettingsStore } from "@/stores/useTransactionSettingsStore";

const TEST_ALLOWED_SLIPPAGE = new Percent(2, 100);

enum ADD_LIQUIDITY_TYPE {
  CREATE_AND_MINT,
  MINT,
  INCREASE,
}

export function useAddLiquidityParams({
  position,
  increase,
  createPool,
  tokenId,
}: {
  position?: Position;
  increase?: boolean;
  createPool?: boolean;
  tokenId?: string;
}) {
  const { slippage, deadline: _deadline } = useTransactionSettingsStore();
  const deadline = useTransactionDeadline(_deadline);
  const { tokenA, tokenB } = useAddLiquidityTokensStore();
  const { address: accountAddress, chainId } = useAccount();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const addLiquidityType = useMemo(() => {
    if (createPool) return ADD_LIQUIDITY_TYPE.CREATE_AND_MINT;
    if (increase && tokenId) return ADD_LIQUIDITY_TYPE.INCREASE;
    return ADD_LIQUIDITY_TYPE.MINT;
  }, [createPool, increase, tokenId]);

  const addLiquidityParams = useMemo(() => {
    if (
      !position ||
      !publicClient ||
      !walletClient ||
      !accountAddress ||
      !tokenA ||
      !tokenB ||
      !chainId
    ) {
      return null;
    }

    // get amounts
    const { amount0: amount0Desired, amount1: amount1Desired } = position.mintAmounts;

    // adjust for slippage
    const minimumAmounts = position.mintAmountsWithSlippage(TEST_ALLOWED_SLIPPAGE); // options.slippageTolerance
    const amount0Min = toHex(minimumAmounts.amount0);
    const amount1Min = toHex(minimumAmounts.amount1);

    if (addLiquidityType === ADD_LIQUIDITY_TYPE.CREATE_AND_MINT) {
      // CREATE + MINT
      const createParams = [
        position.pool.token0.address0,
        position.pool.token1.address0,
        position.pool.token0.address1,
        position.pool.token1.address1,
        position.pool.fee,
        toHex(position.pool.sqrtRatioX96) as any,
      ] as [Address, Address, Address, Address, FeeAmount, bigint];

      const mintParams = {
        token0: position.pool.token0.address0,
        token1: position.pool.token1.address0,
        fee: position.pool.fee,
        tickLower: position.tickLower,
        tickUpper: position.tickUpper,
        amount0Desired: toHex(amount0Desired) as any,
        amount1Desired: toHex(amount1Desired) as any,
        amount0Min: amount0Min as any,
        amount1Min: amount1Min as any,
        recipient: accountAddress,
        deadline,
      };

      const encodedCreateParams = encodeFunctionData({
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        functionName: "createAndInitializePoolIfNecessary",
        args: createParams,
      });

      const encodedMintParams = encodeFunctionData({
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        functionName: "mint",
        args: [mintParams],
      });

      const params: {
        address: Address;
        account: Address;
        abi: Abi;
        functionName: "multicall";
        args: [`0x${string}`[]];
      } = {
        address: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
        account: accountAddress,
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        functionName: "multicall" as const,
        args: [[encodedCreateParams, encodedMintParams]],
      };
      return params;
    } else if (addLiquidityType === ADD_LIQUIDITY_TYPE.INCREASE) {
      if (!tokenId) return null;
      // INCREASE LIQUIDITY
      const increaseParams = {
        tokenId: toHex(tokenId) as any,
        amount0Desired: toHex(amount0Desired) as any,
        amount1Desired: toHex(amount1Desired) as any,
        amount0Min: amount0Min as any,
        amount1Min: amount1Min as any,
        recipient: accountAddress,
        deadline,
      };

      const params: {
        address: Address;
        account: Address;
        abi: Abi;
        functionName: "increaseLiquidity";
        args: [
          {
            tokenId: any;
            amount0Desired: any;
            amount1Desired: any;
            amount0Min: any;
            amount1Min: any;
            recipient: `0x${string}`;
            deadline: bigint;
          },
        ];
      } = {
        address: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
        account: accountAddress,
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        functionName: "increaseLiquidity" as const,
        args: [increaseParams],
      };
      return params;
    } else if (addLiquidityType === ADD_LIQUIDITY_TYPE.MINT) {
      //  MINT
      const mintParams = {
        token0: position.pool.token0.address0,
        token1: position.pool.token1.address0,
        fee: position.pool.fee,
        tickLower: position.tickLower,
        tickUpper: position.tickUpper,
        amount0Desired: toHex(amount0Desired) as any,
        amount1Desired: toHex(amount1Desired) as any,
        amount0Min: amount0Min as any,
        amount1Min: amount1Min as any,
        recipient: accountAddress,
        deadline,
      };

      const params: {
        address: Address;
        account: Address;
        abi: Abi;
        functionName: "mint";
        args: [any];
      } = {
        address: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
        account: accountAddress,
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        functionName: "mint" as const,
        args: [mintParams],
      };
      return params;
    }
    return null;
  }, [
    accountAddress,
    deadline,
    publicClient,
    tokenA,
    tokenB,
    walletClient,
    chainId,
    addLiquidityType,
    position,
    tokenId,
  ]);

  return { addLiquidityParams, addLiquidityType };
}

export function useAddLiquidityEstimatedGas({
  position,
  increase,
  createPool,
  tokenId,
}: {
  position?: Position;
  increase?: boolean;
  createPool?: boolean;
  tokenId?: string;
}) {
  const { addLiquidityParams } = useAddLiquidityParams({
    position,
    increase,
    createPool,
    tokenId,
  });

  const { setEstimatedGas } = useEstimatedGasStore();
  const publicClient = usePublicClient();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  useDeepEffect(() => {
    IIFE(async () => {
      if (!addLiquidityParams) {
        return;
      }

      try {
        console.log("Trying to estimate");
        const estimated = await publicClient?.estimateContractGas(addLiquidityParams);
        if (estimated) {
          setEstimatedGas({
            estimatedGasId: EstimatedGasId.mint,
            estimatedGas: estimated,
          });
        }
        console.log(estimated);
      } catch (error) {
        console.error("useAddLiquidityEstimatedGas ~ error:", error);
        setEstimatedGas({
          estimatedGasId: EstimatedGasId.mint,
          estimatedGas: BigInt(530000),
        });
      }
    });
  }, [publicClient, addLiquidityParams, blockNumber]);
}

export const useAddLiquidity = ({
  position,
  increase,
  createPool,
  tokenId,
}: {
  position?: Position;
  increase?: boolean;
  createPool?: boolean;
  tokenId?: string;
}) => {
  const [status, setStatus] = useState(AllowanceStatus.INITIAL);
  const { address: accountAddress, chainId } = useAccount();
  const { addRecentTransaction } = useRecentTransactionsStore();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { addLiquidityParams } = useAddLiquidityParams({
    position,
    increase,
    createPool,
    tokenId,
  });

  const handleAddLiquidity = useCallback(async () => {
    if (
      !position ||
      !publicClient ||
      !walletClient ||
      !accountAddress ||
      !chainId ||
      !addLiquidityParams
    ) {
      console.log("handleAddLiquidity: SOMESING UNDEFINED");
      return;
    }
    setStatus(AllowanceStatus.PENDING);
    try {
      const estimatedGas = await publicClient.estimateContractGas(addLiquidityParams);

      const { request } = await publicClient.simulateContract({
        ...addLiquidityParams,
        gas: estimatedGas + BigInt(30000),
      });
      const hash = await walletClient.writeContract({ ...request, account: undefined });

      const transaction = await publicClient.getTransaction({
        hash,
      });

      const nonce = transaction.nonce;

      addRecentTransaction(
        {
          hash,
          nonce,
          chainId,
          gas: {
            model: GasFeeModel.EIP1559,
            gas: (estimatedGas + BigInt(30000)).toString(),
            maxFeePerGas: undefined,
            maxPriorityFeePerGas: undefined,
          },
          params: {
            ...stringifyObject(addLiquidityParams),
            abi: [
              getAbiItem({
                name: addLiquidityParams.functionName,
                abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
              }),
            ],
          },
          title: {
            template: RecentTransactionTitleTemplate.ADD,
            symbol0: position.pool.token0.symbol!,
            symbol1: position.pool.token1.symbol!,
            amount0: formatUnits(
              BigInt(JSBI.toNumber(position.mintAmounts.amount0)),
              position.pool.token0.decimals,
            ),
            amount1: formatUnits(
              BigInt(JSBI.toNumber(position.mintAmounts.amount1)),
              position.pool.token1.decimals,
            ),
            logoURI0: position.pool.token0?.logoURI || "/tokens/placeholder.svg",
            logoURI1: position.pool.token1?.logoURI || "/tokens/placeholder.svg",
          },
        },
        accountAddress,
      );
      if (hash) {
        setStatus(AllowanceStatus.LOADING);
        await publicClient.waitForTransactionReceipt({ hash });
        setStatus(AllowanceStatus.SUCCESS);
      }
    } catch (error) {
      console.error("useAddLiquidity ~ error:", error);
      addToast("Unexpected error, please contact support", "error");
      setStatus(AllowanceStatus.INITIAL);
    }
  }, [
    accountAddress,
    publicClient,
    walletClient,
    chainId,
    addRecentTransaction,
    addLiquidityParams,
    position,
  ]);

  return {
    handleAddLiquidity,
    status,
  };
};
