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
import { useConfirmSwapDialogStore } from "@/app/[locale]/swap/stores/useConfirmSwapDialogOpened";
import { useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import { useSwapSettingsStore } from "@/app/[locale]/swap/stores/useSwapSettingsStore";
import { SwapStatus, useSwapStatusStore } from "@/app/[locale]/swap/stores/useSwapStatusStore";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import { ERC223_ABI } from "@/config/abis/erc223";
import { POOL_ABI } from "@/config/abis/pool";
import { ROUTER_ABI } from "@/config/abis/router";
import { formatFloat } from "@/functions/formatFloat";
import useAllowance from "@/hooks/useAllowance";
import useTransactionDeadline from "@/hooks/useTransactionDeadline";
import addToast from "@/other/toast";
import { ROUTER_ADDRESS } from "@/sdk_hybrid/addresses";
import { DEX_SUPPORTED_CHAINS, DexChainId } from "@/sdk_hybrid/chains";
import { FeeAmount } from "@/sdk_hybrid/constants";
import { ONE } from "@/sdk_hybrid/internalConstants";
import { useComputePoolAddressDex } from "@/sdk_hybrid/utils/computePoolAddress";
import { TickMath } from "@/sdk_hybrid/utils/tickMath";
import { useConfirmInWalletAlertStore } from "@/stores/useConfirmInWalletAlertStore";
import {
  GasFeeModel,
  RecentTransactionTitleTemplate,
  stringifyObject,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";

export default function useSwap() {
  const { data: walletClient } = useWalletClient();
  const { tokenA, tokenB, tokenAAddress, tokenBAddress } = useSwapTokensStore();
  const { trade } = useTrade();
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient();

  const [estimatedGas, setEstimatedGas] = useState<bigint>(BigInt(0));

  const { gasPrice } = useSwapGas();

  const { slippage, deadline: _deadline } = useSwapSettingsStore();
  const deadline = useTransactionDeadline(_deadline);
  const { typedValue } = useSwapAmountsStore();
  const { addRecentTransaction } = useRecentTransactionsStore();

  const { status: swapStatus, setStatus: setSwapStatus } = useSwapStatusStore();
  const { isOpen: confirmDialogOpened } = useConfirmSwapDialogStore();

  const {
    isOpened: confirmAlertOpened,
    openConfirmInWalletAlert,
    closeConfirmInWalletAlert,
  } = useConfirmInWalletAlertStore();
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

  useEffect(() => {
    if (isPendingA) {
      setSwapStatus(SwapStatus.PENDING_APPROVE);
    }
    if (isLoadingA) {
      setSwapStatus(SwapStatus.LOADING_APPROVE);
    }
  }, [isLoadingA, isPendingA, setSwapStatus]);

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
          poolAddress.poolAddress,
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

  useEffect(() => {
    if (swapStatus === SwapStatus.SUCCESS && !confirmDialogOpened) {
      setSwapStatus(SwapStatus.INITIAL);
    }
  }, [confirmDialogOpened, setSwapStatus, swapStatus]);
  //
  // useEffect(() => {
  //   if (swapStatus === SwapStatus.LOADING && confirmAlertOpened) {
  //     closeConfirmInWalletAlert();
  //   }
  // }, [closeConfirmInWalletAlert, confirmAlertOpened, confirmDialogOpened, setSwapStatus, swapStatus]);
  //
  // useEffect(() => {
  //   if (!publicClient || !swapParams) {
  //     return;
  //   }
  //
  //   IIFE(async () => {
  //     try {
  //       const _estimatedGas = await publicClient.estimateContractGas({
  //         ...swapParams,
  //         account: address,
  //       } as any); //TODO: remove any
  //       setEstimatedGas(_estimatedGas);
  //     } catch (e) {
  //       console.log("Error while estimating gas");
  //     }
  //   });
  // }, [publicClient, swapParams, address]);

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

    setSwapStatus(SwapStatus.PENDING);
    openConfirmInWalletAlert("Confirm action in your wallet");

    const hash = await walletClient.writeContract(swapParams as any); // TODO: remove any

    closeConfirmInWalletAlert();

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
    closeConfirmInWalletAlert,
    estimatedGas,
    gasPrice,
    isAllowedA,
    openConfirmInWalletAlert,
    output,
    publicClient,
    setSwapStatus,
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
    isPendingApprove: swapStatus === SwapStatus.PENDING_APPROVE,
    isLoadingApprove: swapStatus === SwapStatus.LOADING_APPROVE,
    handleApprove: () => null,
    isPendingSwap: swapStatus === SwapStatus.PENDING,
    isLoadingSwap: swapStatus === SwapStatus.LOADING,
    isSuccessSwap: swapStatus === SwapStatus.SUCCESS,
    estimatedGas,
  };
}
