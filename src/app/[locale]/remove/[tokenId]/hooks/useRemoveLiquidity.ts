import JSBI from "jsbi";
import { useCallback } from "react";
import { Address, encodeFunctionData, formatUnits, getAbiItem } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import { ERC20_ABI } from "@/config/abis/erc20";
import { NONFUNGIBLE_POSITION_MANAGER_ABI } from "@/config/abis/nonfungiblePositionManager";
import useTransactionDeadline from "@/hooks/useTransactionDeadline";
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/sdk_hybrid/addresses";
import { DexChainId } from "@/sdk_hybrid/chains";
import { Percent } from "@/sdk_hybrid/entities/fractions/percent";
import { Position } from "@/sdk_hybrid/entities/position";
import { Token } from "@/sdk_hybrid/entities/token";
import { toHex } from "@/sdk_hybrid/utils/calldata";
import {
  GasFeeModel,
  RecentTransactionTitleTemplate,
  stringifyObject,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";
import { useTransactionSettingsStore } from "@/stores/useTransactionSettingsStore";

export default function useRemoveLiquidity({
  percentage,
  tokenId,
}: {
  percentage: number;
  tokenId: string | undefined;
}) {
  const { slippage, deadline: _deadline } = useTransactionSettingsStore();
  const deadline = useTransactionDeadline(_deadline);
  const { address: accountAddress } = useAccount();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { addRecentTransaction } = useRecentTransactionsStore();
  const { chainId } = useAccount();

  const handleRemoveLiquidity = useCallback(
    async (tokenA: Token | null, tokenB: Token | null, position?: Position) => {
      if (
        !position ||
        !publicClient ||
        !walletClient ||
        !accountAddress ||
        !tokenA ||
        !tokenB ||
        !chainId ||
        !tokenId
      ) {
        return;
      }

      try {
        const percent = new Percent(percentage, 100);
        const partialPosition = new Position({
          pool: position.pool,
          liquidity: percent.multiply(position.liquidity).quotient,
          tickLower: position.tickLower,
          tickUpper: position.tickUpper,
        });

        const TEST_ALLOWED_SLIPPAGE = new Percent(2, 100);

        // get amounts
        const { amount0: amount0Desired, amount1: amount1Desired } = position.mintAmounts;

        // adjust for slippage
        const minimumAmounts = partialPosition.burnAmountsWithSlippage(TEST_ALLOWED_SLIPPAGE); // options.slippageTolerance
        const amount0Min = toHex(minimumAmounts.amount0);
        const amount1Min = toHex(minimumAmounts.amount1);

        const decreaseParams: {
          tokenId: any;
          liquidity: any;
          amount0Min: any;
          amount1Min: any;
          deadline: bigint;
        } = {
          tokenId: toHex(JSBI.BigInt(tokenId)) as any,
          liquidity: toHex(partialPosition.liquidity) as any,
          amount0Min: amount0Min as any,
          amount1Min: amount1Min as any,
          deadline,
        };
        const params = {
          account: accountAddress as Address,
          abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
          functionName: "decreaseLiquidity" as const,
          address: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
          args: [decreaseParams] as [typeof decreaseParams],
        };

        const estimatedGas = await publicClient.estimateContractGas(params);

        const { request } = await publicClient.simulateContract({
          ...params,
          gas: estimatedGas + BigInt(30000),
        });

        const hash = await walletClient.writeContract(request);

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
              ...stringifyObject(params),
              abi: [getAbiItem({ name: "approve", abi: ERC20_ABI })],
            },
            title: {
              symbol0: tokenA.symbol!,
              symbol1: tokenB.symbol!,
              template: RecentTransactionTitleTemplate.REMOVE,
              amount0: (+formatUnits(
                BigInt(minimumAmounts.amount0.toString()),
                tokenA.decimals,
              )).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
              amount1: (+formatUnits(
                BigInt(minimumAmounts.amount1.toString()),
                tokenB.decimals,
              )).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
              logoURI0: tokenA.logoURI || "",
              logoURI1: tokenB.logoURI || "",
            },
          },
          accountAddress,
        );
      } catch (e) {
        console.log(e);
      }
    },
    [
      accountAddress,
      addRecentTransaction,
      chainId,
      deadline,
      percentage,
      publicClient,
      walletClient,
      tokenId,
    ],
  );

  return { handleRemoveLiquidity };
}
