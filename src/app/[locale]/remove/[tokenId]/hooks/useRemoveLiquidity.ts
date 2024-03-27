import JSBI from "jsbi";
import { useCallback } from "react";
import { Address, encodeFunctionData } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import { useAddLiquidityTokensStore } from "@/app/[locale]/add/[[...currency]]/stores/useAddLiquidityTokensStore";
import { NONFUNGIBLE_POSITION_MANAGER_ABI } from "@/config/abis/nonfungiblePositionManager";
import { nonFungiblePositionManagerAddress } from "@/config/contracts";
import { WrappedToken } from "@/config/types/WrappedToken";
import useTransactionDeadline from "@/hooks/useTransactionDeadline";
import { Percent } from "@/sdk/entities/fractions/percent";
import { Position } from "@/sdk/entities/position";
import { toHex } from "@/sdk/utils/calldata";
import { useTransactionSettingsStore } from "@/stores/useTransactionSettingsStore";

export default function useRemoveLiquidity({ percentage }: { percentage: number }) {
  const { slippage, deadline: _deadline } = useTransactionSettingsStore();
  const deadline = useTransactionDeadline(_deadline);
  const { address: accountAddress } = useAccount();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const handleRemoveLiquidity = useCallback(
    async (tokenA: WrappedToken | null, tokenB: WrappedToken | null, position?: Position) => {
      if (!position || !publicClient || !walletClient || !accountAddress || !tokenA || !tokenB) {
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

        const hash = await walletClient.writeContract({
          account: accountAddress,
          abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
          functionName: "multicall" as const,
          address: nonFungiblePositionManagerAddress as Address,
          args: [[encodedDecreaseParams]],
        });
      } catch (e) {
        console.log(e);
      }
    },
    [accountAddress, deadline, publicClient, walletClient],
  );

  return { handleRemoveLiquidity };
}
