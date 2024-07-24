import JSBI from "jsbi";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo } from "react";
import {
  Address,
  encodeAbiParameters,
  encodeFunctionData,
  encodePacked,
  getAbiItem,
  parseUnits,
} from "viem";
import { useAccount, useBlockNumber, usePublicClient, useWalletClient } from "wagmi";

import useSwapGas from "@/app/[locale]/swap/hooks/useSwapGas";
import { useTrade } from "@/app/[locale]/swap/libs/trading";
import { useConfirmSwapDialogStore } from "@/app/[locale]/swap/stores/useConfirmSwapDialogOpened";
import { useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import { useSwapEstimatedGasStore } from "@/app/[locale]/swap/stores/useSwapEstimatedGasStore";
import { useSwapSettingsStore } from "@/app/[locale]/swap/stores/useSwapSettingsStore";
import { SwapStatus, useSwapStatusStore } from "@/app/[locale]/swap/stores/useSwapStatusStore";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import { ERC223_ABI } from "@/config/abis/erc223";
import { POOL_ABI } from "@/config/abis/pool";
import { ROUTER_ABI } from "@/config/abis/router";
import { formatFloat } from "@/functions/formatFloat";
import { IIFE } from "@/functions/iife";
import { useStoreAllowance } from "@/hooks/useAllowance";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import useDeepEffect from "@/hooks/useDeepEffect";
import useTransactionDeadline from "@/hooks/useTransactionDeadline";
import { ROUTER_ADDRESS } from "@/sdk_hybrid/addresses";
import { DEX_SUPPORTED_CHAINS, DexChainId } from "@/sdk_hybrid/chains";
import { FeeAmount } from "@/sdk_hybrid/constants";
import { ONE } from "@/sdk_hybrid/internalConstants";
import { getTokenAddressForStandard, Standard } from "@/sdk_hybrid/standard";
import { useComputePoolAddressDex } from "@/sdk_hybrid/utils/computePoolAddress";
import { TickMath } from "@/sdk_hybrid/utils/tickMath";
import { useConfirmInWalletAlertStore } from "@/stores/useConfirmInWalletAlertStore";
import {
  GasFeeModel,
  RecentTransactionTitleTemplate,
  stringifyObject,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";

export function useSwapStatus() {
  const { status: swapStatus } = useSwapStatusStore();

  return {
    isPendingApprove: swapStatus === SwapStatus.PENDING_APPROVE,
    isLoadingApprove: swapStatus === SwapStatus.LOADING_APPROVE,
    isPendingSwap: swapStatus === SwapStatus.PENDING,
    isLoadingSwap: swapStatus === SwapStatus.LOADING,
    isSuccessSwap: swapStatus === SwapStatus.SUCCESS,
    isRevertedSwap: swapStatus === SwapStatus.ERROR,
    isSettledSwap: swapStatus === SwapStatus.SUCCESS || swapStatus === SwapStatus.ERROR,
    isRevertedApprove: swapStatus === SwapStatus.APPROVE_ERROR,
  };
}

export function useSwapParams() {
  const { tokenA, tokenB, tokenAStandard, tokenBStandard } = useSwapTokensStore();
  const chainId = useCurrentChainId();
  const { address } = useAccount();

  const { typedValue } = useSwapAmountsStore();

  const { deadline: _deadline } = useSwapSettingsStore();
  const deadline = useTransactionDeadline(_deadline);

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
      !poolAddress ||
      !typedValue
    ) {
      return null;
    }

    const zeroForOne = tokenA.address0 < tokenB.address0;

    const sqrtPriceLimitX96 = zeroForOne
      ? JSBI.add(TickMath.MIN_SQRT_RATIO, ONE)
      : JSBI.subtract(TickMath.MAX_SQRT_RATIO, ONE);

    const routerParams = {
      tokenIn: getTokenAddressForStandard(tokenA, tokenAStandard),
      tokenOut: tokenB.address0,
      fee: FeeAmount.MEDIUM,
      recipient: address as Address,
      deadline,
      amountIn: parseUnits(typedValue, tokenA.decimals),
      amountOutMinimum: BigInt(0),
      sqrtPriceLimitX96: BigInt(sqrtPriceLimitX96.toString()),
      prefer223Out: tokenBStandard === Standard.ERC223,
    };

    if (tokenAStandard === Standard.ERC20) {
      return {
        address: ROUTER_ADDRESS[chainId as DexChainId],
        abi: ROUTER_ABI,
        functionName: "exactInputSingle" as "exactInputSingle",
        args: [routerParams],
      };
    }

    if (tokenAStandard === Standard.ERC223) {
      return {
        address: getTokenAddressForStandard(tokenA, tokenAStandard),
        abi: ERC223_ABI,
        functionName: "transfer",
        args: [
          ROUTER_ADDRESS[chainId],
          parseUnits(typedValue, tokenA.decimals), // amountSpecified
          encodeFunctionData({
            abi: ROUTER_ABI,
            functionName: "exactInputSingle",
            args: [routerParams],
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
    tokenAStandard,
    tokenB,
    tokenBStandard,
    typedValue,
  ]);

  return { swapParams };
}

export function useSwapEstimatedGas() {
  const { address } = useAccount();
  const { swapParams } = useSwapParams();
  const { setEstimatedGas } = useSwapEstimatedGasStore();
  const publicClient = usePublicClient();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  useDeepEffect(() => {
    IIFE(async () => {
      if (!swapParams || !address) {
        return;
      }

      try {
        const estimated = await publicClient?.estimateContractGas({
          account: address,
          ...swapParams,
        } as any);
        if (estimated) {
          setEstimatedGas(estimated);
        }
        console.log(estimated);
      } catch (e) {
        console.log(e);
        setEstimatedGas(BigInt(195000));
      }
    });
  }, [publicClient, address, swapParams, blockNumber]);
}
export default function useSwap() {
  const t = useTranslations("Swap");
  const { data: walletClient } = useWalletClient();
  const { tokenA, tokenB, tokenAStandard } = useSwapTokensStore();
  const { trade } = useTrade();
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const chainId = useCurrentChainId();
  const { estimatedGas } = useSwapEstimatedGasStore();

  const { gasPrice } = useSwapGas();

  const { slippage } = useSwapSettingsStore();
  const { typedValue } = useSwapAmountsStore();
  const { addRecentTransaction } = useRecentTransactionsStore();

  const {
    status: swapStatus,
    setStatus: setSwapStatus,
    setSwapHash,
    setApproveHash,
  } = useSwapStatusStore();
  const { isOpen: confirmDialogOpened } = useConfirmSwapDialogStore();

  const { openConfirmInWalletAlert, closeConfirmInWalletAlert } = useConfirmInWalletAlertStore();

  const { isAllowed: isAllowedA, writeTokenApprove: approveA } = useStoreAllowance({
    token: tokenA,
    contractAddress: ROUTER_ADDRESS[chainId],
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

  const { swapParams } = useSwapParams();

  useEffect(() => {
    if (
      (swapStatus === SwapStatus.SUCCESS ||
        swapStatus === SwapStatus.ERROR ||
        swapStatus === SwapStatus.APPROVE_ERROR) &&
      !confirmDialogOpened
    ) {
      setTimeout(() => {
        setSwapStatus(SwapStatus.INITIAL);
      }, 400);
    }
  }, [confirmDialogOpened, setSwapStatus, swapStatus]);

  const handleSwap = useCallback(async () => {
    if (!publicClient) {
      return;
    }

    if (!isAllowedA && tokenAStandard === Standard.ERC20) {
      openConfirmInWalletAlert(t("confirm_action_in_your_wallet_alert"));

      setSwapStatus(SwapStatus.PENDING_APPROVE);
      const result = await approveA();

      if (!result?.success) {
        setSwapStatus(SwapStatus.INITIAL);
        closeConfirmInWalletAlert();
        return;
      } else {
        setApproveHash(result.hash);
        setSwapStatus(SwapStatus.LOADING_APPROVE);
        closeConfirmInWalletAlert();

        const approveReceipt = await publicClient.waitForTransactionReceipt({ hash: result.hash });
        //
        // if (approveReceipt.status === "success") {
        //   setSwapStatus(SwapStatus.SUCCESS);
        // }

        if (approveReceipt.status === "reverted") {
          setSwapStatus(SwapStatus.APPROVE_ERROR);
          return;
        }
      }
    }

    if (
      !walletClient ||
      !address ||
      !tokenA ||
      !tokenB ||
      !trade ||
      !output ||
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

    setSwapStatus(SwapStatus.PENDING);
    openConfirmInWalletAlert(t("confirm_action_in_your_wallet_alert"));

    let hash;

    try {
      hash = await walletClient.writeContract(swapParams as any); // TODO: remove any
    } catch (e) {
      setSwapStatus(SwapStatus.INITIAL);

      console.log(e);
    }

    closeConfirmInWalletAlert();

    if (hash) {
      setSwapHash(hash);
      const transaction = await publicClient.getTransaction({
        hash,
      });

      const nonce = transaction.nonce;
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

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === "success") {
        setSwapStatus(SwapStatus.SUCCESS);
      }

      if (receipt.status === "reverted") {
        setSwapStatus(SwapStatus.ERROR);
        console.log(receipt);
      }
    } else {
      setSwapStatus(SwapStatus.INITIAL);
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
    setApproveHash,
    setSwapHash,
    setSwapStatus,
    swapParams,
    t,
    tokenA,
    tokenAStandard,
    tokenB,
    trade,
    typedValue,
    walletClient,
  ]);

  return {
    handleSwap,
    isAllowedA: isAllowedA,
    handleApprove: () => null,
    estimatedGas,
  };
}
