import JSBI from "jsbi";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Address,
  encodeAbiParameters,
  encodeFunctionData,
  encodePacked,
  getAbiItem,
  parseUnits,
} from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import useSwapGas from "@/app/[locale]/swap/hooks/useSwapGas";
import { useTrade } from "@/app/[locale]/swap/libs/trading";
import { useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import { ERC223_ABI } from "@/config/abis/erc223";
import { POOL_ABI } from "@/config/abis/pool";
import { ROUTER_ABI } from "@/config/abis/router";
import { formatFloat } from "@/functions/formatFloat";
import { IIFE } from "@/functions/iife";
import useAllowance from "@/hooks/useAllowance";
import useTransactionDeadline from "@/hooks/useTransactionDeadline";
import { ROUTER_ADDRESS } from "@/sdk_hybrid/addresses";
import { DEX_SUPPORTED_CHAINS, DexChainId } from "@/sdk_hybrid/chains";
import { FeeAmount } from "@/sdk_hybrid/constants";
import { ONE } from "@/sdk_hybrid/internalConstants";
import { useComputePoolAddressDex } from "@/sdk_hybrid/utils/computePoolAddress";
import { TickMath } from "@/sdk_hybrid/utils/tickMath";
import {
  GasFeeModel,
  RecentTransactionTitleTemplate,
  stringifyObject,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";
import { useTransactionSettingsStore } from "@/stores/useTransactionSettingsStore";

enum SwapStatus {
  INITIAL,
  PENDING,
  LOADING,
  SUCCESS,
}
export default function useSwap() {
  const { data: walletClient } = useWalletClient();
  const { tokenA, tokenB, tokenAAddress, tokenBAddress } = useSwapTokensStore();
  const { trade } = useTrade();
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient();

  const [estimatedGas, setEstimatedGas] = useState<bigint>(BigInt(0));

  const { gasPrice } = useSwapGas();

  const { slippage, deadline: _deadline } = useTransactionSettingsStore();
  const deadline = useTransactionDeadline(_deadline);
  const { typedValue } = useSwapAmountsStore();
  const { addRecentTransaction } = useRecentTransactionsStore();

  const [swapStatus, setSwapStatus] = useState(SwapStatus.INITIAL);

  const {
    isAllowed: isAllowedA,
    writeTokenApprove: approveA,
    isPending: isPendingA,
    isLoading: isLoadingA,
  } = useAllowance({
    token: tokenA,
    contractAddress: ROUTER_ADDRESS[chainId as DexChainId],
    amountToCheck: parseUnits(typedValue, tokenA?.decimals || 18),
  });

  const gasPriceFormatted = useMemo(() => {
    switch (gasPrice.model) {
      case GasFeeModel.EIP1559:
        return {
          maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
          maxFeePerGas: gasPrice.maxFeePerGas,
        };
      case GasFeeModel.LEGACY:
        return { gasPrice: gasPrice.gasPrice };
    }
  }, [gasPrice]);

  const output = useMemo(() => {
    if (!trade) {
      return "";
    }

    return (+trade.outputAmount.toSignificant() * (100 - slippage)) / 100;
  }, [slippage, trade]);

  const poolAddress = useComputePoolAddressDex({
    tokenA,
    tokenB,
    tier: FeeAmount.MEDIUM,
  });

  const swapParams = useMemo(() => {
    if (
      !tokenA ||
      !tokenB ||
      !chainId ||
      !DEX_SUPPORTED_CHAINS.includes(chainId) ||
      !tokenAAddress ||
      !tokenBAddress ||
      !poolAddress
    ) {
      console.log({
        tokenA,
        tokenB,
        chainId,
        tokenAAddress,
        tokenBAddress,
        poolAddress,
      });

      return null;
    }

    if (tokenAAddress === tokenA.address0) {
      // mean we are sending ERC-20 token with approve + funcName
      const zeroForOne = tokenA.address0 < tokenB.address0;

      const sqrtPriceLimitX96 = zeroForOne
        ? JSBI.add(TickMath.MIN_SQRT_RATIO, ONE)
        : JSBI.subtract(TickMath.MAX_SQRT_RATIO, ONE);

      return {
        address: ROUTER_ADDRESS[chainId as DexChainId],
        abi: ROUTER_ABI,
        functionName: "exactInputSingle" as "exactInputSingle",
        args: [
          {
            tokenIn: tokenAAddress,
            tokenOut: tokenBAddress,
            fee: FeeAmount.MEDIUM,
            recipient: address as Address,
            deadline,
            amountIn: parseUnits(typedValue, tokenA.decimals),
            amountOutMinimum: BigInt(0),
            sqrtPriceLimitX96: BigInt(sqrtPriceLimitX96.toString()),
            prefer223Out: tokenBAddress === tokenB.address1,
          },
        ],
      };
    }

    if (tokenAAddress === tokenA.address1) {
      const zeroForOne = tokenA.address0 < tokenB.address0;

      const sqrtPriceLimitX96 = zeroForOne
        ? JSBI.add(TickMath.MIN_SQRT_RATIO, ONE)
        : JSBI.subtract(TickMath.MAX_SQRT_RATIO, ONE);

      return {
        address: tokenA.address1,
        abi: ERC223_ABI,
        functionName: "transfer",
        args: [
          poolAddress,
          parseUnits(typedValue, tokenA.decimals), // amountSpecified
          encodeFunctionData({
            abi: POOL_ABI,
            functionName: "swap",
            args: [
              address as Address, //account address
              zeroForOne, //zeroForOne
              parseUnits(typedValue, tokenA.decimals), // amountSpecified
              BigInt(sqrtPriceLimitX96.toString()), //sqrtPriceLimitX96
              tokenBAddress === tokenB.address1, // prefer223Out
              encodeAbiParameters(
                [
                  { name: "path", type: "bytes" },
                  { name: "payer", type: "address" },
                ],
                [
                  encodePacked(
                    ["address", "uint24", "address"],
                    [tokenA.address0, FeeAmount.MEDIUM, tokenB.address0],
                  ),
                  "0x0000000000000000000000000000000000000000",
                ],
              ),
            ],
          }),
        ],
      };
    }
  }, [
    address,
    chainId,
    deadline,
    poolAddress,
    tokenA,
    tokenAAddress,
    tokenB,
    tokenBAddress,
    typedValue,
  ]);

  console.log(swapParams);

  useEffect(() => {
    if (!publicClient || !swapParams) {
      return;
    }

    IIFE(async () => {
      try {
        const _estimatedGas = await publicClient.estimateContractGas({
          ...swapParams,
          account: address,
        } as any); //TODO: remove any
        setEstimatedGas(_estimatedGas);
      } catch (e) {
        console.log("Error while estimating gas");
      }
    });
  }, [publicClient, swapParams, address]);

  const handleSwap = useCallback(async () => {
    if (!isAllowedA && tokenA?.address0 === tokenAAddress) {
      try {
        await approveA();
      } catch (e) {
        console.log("Approve failed");
        return;
      }
    }

    if (
      !walletClient ||
      !address ||
      !tokenA ||
      !tokenB ||
      !trade ||
      !output ||
      !publicClient ||
      !chainId ||
      !swapParams
      // !estimatedGas
    ) {
      console.log({
        walletClient,
        address,
        tokenA,
        tokenB,
        trade,
        output,
        publicClient,
        chainId,
        swapParams,
      });
      return;
    }

    // console.log(swapParams);
    // const { request } = await publicClient.simulateContract({
    //   ...swapParams,
    //   account: address,
    //   gas: estimatedGas + BigInt(30000),
    // });
    // const hash = await walletClient.writeContract(swapParams);

    let hash;

    setSwapStatus(SwapStatus.PENDING);
    hash = await walletClient.writeContract(swapParams as any); // TODO: remove any

    const nonce = await publicClient.getTransactionCount({
      address,
      blockTag: "pending",
    });

    if (hash) {
      setSwapStatus(SwapStatus.LOADING);
      addRecentTransaction(
        {
          hash,
          nonce,
          chainId,
          gas: {
            ...stringifyObject(gasPrice),
            gas: (estimatedGas + BigInt(30000)).toString(),
          },
          params: {
            ...stringifyObject(swapParams),
            abi: [getAbiItem({ name: "exactInputSingle", abi: ROUTER_ABI })],
          },
          title: {
            symbol0: tokenA.symbol!,
            symbol1: tokenB.symbol!,
            template: RecentTransactionTitleTemplate.SWAP,
            amount0: formatFloat(typedValue),
            amount1: formatFloat(output.toString()),
            logoURI0: tokenA?.logoURI || "/tokens/placeholder.svg",
            logoURI1: tokenB?.logoURI || "/tokens/placeholder.svg",
          },
        },
        address,
      );

      await publicClient.waitForTransactionReceipt({ hash });
      setSwapStatus(SwapStatus.SUCCESS);
    }
  }, [
    addRecentTransaction,
    address,
    approveA,
    chainId,
    estimatedGas,
    gasPrice,
    isAllowedA,
    output,
    publicClient,
    swapParams,
    tokenA,
    tokenAAddress,
    tokenB,
    trade,
    typedValue,
    walletClient,
  ]);

  return {
    handleSwap,
    isAllowedA: isAllowedA,
    isPendingApprove: isPendingA,
    isLoadingApprove: isLoadingA,
    handleApprove: () => null,
    isPendingSwap: swapStatus === SwapStatus.PENDING,
    isLoadingSwap: swapStatus === SwapStatus.LOADING,
    isSuccessSwap: swapStatus === SwapStatus.SUCCESS,
    estimatedGas,
  };
}
