import JSBI from "jsbi";
import { useCallback } from "react";
import { Address, encodeFunctionData, formatUnits, getAbiItem } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import { useAddLiquidityTokensStore } from "@/app/[locale]/add/[[...currency]]/stores/useAddLiquidityTokensStore";
import { ERC20_ABI } from "@/config/abis/erc20";
import { NONFUNGIBLE_POSITION_MANAGER_ABI } from "@/config/abis/nonfungiblePositionManager";
import { nonFungiblePositionManagerAddress } from "@/config/contracts";
import { WrappedToken } from "@/config/types/WrappedToken";
import useTransactionDeadline from "@/hooks/useTransactionDeadline";
import { CurrencyAmount } from "@/sdk/entities/fractions/currencyAmount";
import { Percent } from "@/sdk/entities/fractions/percent";
import { Position } from "@/sdk/entities/position";
import { toHex } from "@/sdk/utils/calldata";
import {
  GasFeeModel,
  RecentTransactionTitleTemplate,
  stringifyObject,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";
import { useTransactionSettingsStore } from "@/stores/useTransactionSettingsStore";

export default function useRemoveLiquidity({ percentage }: { percentage: number }) {
  const { slippage, deadline: _deadline } = useTransactionSettingsStore();
  const deadline = useTransactionDeadline(_deadline);
  const { address: accountAddress } = useAccount();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { addRecentTransaction } = useRecentTransactionsStore();
  const { chainId } = useAccount();

  const handleRemoveLiquidity = useCallback(
    async (tokenA: WrappedToken | null, tokenB: WrappedToken | null, position?: Position) => {
      if (
        !position ||
        !publicClient ||
        !walletClient ||
        !accountAddress ||
        !tokenA ||
        !tokenB ||
        !chainId
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

        const decreaseParams = {
          tokenId: toHex(JSBI.BigInt(5)),
          liquidity: toHex(partialPosition.liquidity),
          amount0Min,
          amount1Min,
          deadline,
        };

        const encodedDecreaseParams = encodeFunctionData({
          abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
          functionName: "decreaseLiquidity",
          args: [decreaseParams as any],
        });

        const params = {
          account: accountAddress,
          abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
          functionName: "multicall" as const,
          address: nonFungiblePositionManagerAddress as Address,
          args: [[encodedDecreaseParams]] as any,
        };

        const estimatedGas = await publicClient.estimateContractGas(params);

        const { request } = await publicClient.simulateContract({
          ...params,
          gas: estimatedGas + BigInt(30000),
        });

        console.log("🚀 ~ handleRemoveLiquidity ~ params:", decreaseParams);
        const hash = await walletClient.writeContract(request);

        const nonce = await publicClient.getTransactionCount({
          address: accountAddress,
          blockTag: "pending",
        });

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
    ],
  );

  return { handleRemoveLiquidity };
}
