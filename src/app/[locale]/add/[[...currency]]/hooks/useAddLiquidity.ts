import JSBI from "jsbi";
import { useCallback } from "react";
import { Address, encodeFunctionData, parseUnits } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import { useLiquidityTierStore } from "@/app/[locale]/add/[[...currency]]/hooks/useLiquidityTierStore";
import { useAddLiquidityTokensStore } from "@/app/[locale]/add/[[...currency]]/stores/useAddLiquidityTokensStore";
import { NONFUNGIBLE_POSITION_MANAGER_ABI } from "@/config/abis/nonfungiblePositionManager";
import { nonFungiblePositionManagerAddress } from "@/config/contracts";
import useTransactionDeadline from "@/hooks/useTransactionDeadline";
import { FeeAmount } from "@/sdk";
import { Percent } from "@/sdk/entities/fractions/percent";
import { Position } from "@/sdk/entities/position";
import { toHex } from "@/sdk/utils/calldata";
import { TickMath } from "@/sdk/utils/tickMath";
import { useTransactionSettingsStore } from "@/stores/useTransactionSettingsStore";

export default function useAddLiquidity() {
  const { slippage, deadline: _deadline } = useTransactionSettingsStore();
  const deadline = useTransactionDeadline(_deadline);
  const { tokenA, tokenB, setTokenA, setTokenB } = useAddLiquidityTokensStore();
  const { address: accountAddress } = useAccount();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { tier, setTier } = useLiquidityTierStore();

  const handleTokenAChange = useCallback(() => {}, []);

  const handleTokenBChange = useCallback(() => {}, []);

  const handleAmountAChange = useCallback(() => {}, []);

  const handleAmountBChange = useCallback(() => {}, []);

  const createPool = useCallback(
    async (position?: Position) => {
      if (!position || !publicClient || !walletClient || !accountAddress || !tokenA || !tokenB) {
        return;
      }

      const initializeParams = {
        account: accountAddress,
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        functionName: "createAndInitializePoolIfNecessary" as const,
        address: nonFungiblePositionManagerAddress as Address,
        args: [
          tokenB.address as Address,
          tokenA.address as Address,
          FeeAmount.LOW,
          BigInt("79228162514264337593543950336"),
        ] as [Address, Address, FeeAmount, bigint],
        gas: BigInt(10_000_000),
      };

      try {
        const estimatedGas = await publicClient.estimateContractGas(initializeParams as any);

        const { request } = await publicClient.simulateContract({
          ...(initializeParams as any),
          gas: estimatedGas + BigInt(30000),
        });
        const hash = await walletClient.writeContract(request);
        console.log("POOL INITIALIZES");
        console.log(hash);
      } catch (e) {
        console.log(e);
      }
    },
    [accountAddress, publicClient, tokenA, tokenB, walletClient],
  );

  const handleAddLiquidity = useCallback(
    async (position?: Position, increase?: boolean) => {
      console.log("🚀 ~ position:", position);
      if (!position || !publicClient || !walletClient || !accountAddress || !tokenA || !tokenB) {
        return;
      }

      const callData = [];

      try {
        // const estimatedGas = await publicClient.estimateContractGas(params as any);
        //
        // const { request } = await publicClient.simulateContract({
        //   ...(params as any),
        //   gas: estimatedGas + BigInt(30000),
        // });

        const TEST_ALLOWED_SLIPPAGE = new Percent(2, 100);

        // get amounts
        const { amount0: amount0Desired, amount1: amount1Desired } = position.mintAmounts;

        // adjust for slippage
        const minimumAmounts = position.mintAmountsWithSlippage(TEST_ALLOWED_SLIPPAGE); // options.slippageTolerance
        const amount0Min = toHex(minimumAmounts.amount0);
        const amount1Min = toHex(minimumAmounts.amount1);

        if (increase) {
          const increaseParams = {
            tokenId: toHex(JSBI.BigInt(5)),
            amount0Desired: toHex(amount0Desired),
            amount1Desired: toHex(amount1Desired),
            amount0Min,
            amount1Min,
            recipient: accountAddress,
            deadline,
          };

          const encodedIncreaseParams = encodeFunctionData({
            abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
            functionName: "increaseLiquidity",
            args: [increaseParams as any],
          });

          console.log("🚀 ~ handleAddLiquidity ~ params:", increaseParams);
          const hash = await walletClient.writeContract({
            account: accountAddress,
            abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
            functionName: "multicall" as const,
            address: nonFungiblePositionManagerAddress as Address,
            args: [[encodedIncreaseParams]],
          });
        } else {
          const params = {
            token0: position.pool.token0.address as Address,
            token1: position.pool.token1.address as Address,
            fee: position.pool.fee,
            tickLower: position.tickLower,
            tickUpper: position.tickUpper,
            amount0Desired: toHex(amount0Desired),
            amount1Desired: toHex(amount1Desired),
            amount0Min,
            amount1Min,
            recipient: accountAddress,
            deadline,
          };

          const encodedParams = encodeFunctionData({
            abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
            functionName: "mint",
            args: [params as any],
          });

          console.log("🚀 ~ handleAddLiquidity ~ params:", params);
          const hash = await walletClient.writeContract({
            account: accountAddress,
            abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
            functionName: "mint" as const,
            address: nonFungiblePositionManagerAddress as Address,
            args: [params as any],
          });
          console.log("🚀 ~ hash:", hash);
        }

        // const hash = await walletClient.writeContract({
        //   account: accountAddress,
        //   abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        //   functionName: "mint" as const,
        //   address: nonFungiblePositionManagerAddress as Address,
        //   args: [
        //     {
        //       token0: tokenB.address as Address, // correct
        //       token1: tokenA.address as Address, // correct
        //       fee: tier,
        //       tickLower: TickMath.MIN_TICK,
        //       tickUpper: TickMath.MAX_TICK,
        //       amount0Desired: BigInt(1),
        //       amount1Desired: BigInt(1) / BigInt("75999999999781595658"),
        //       amount0Min: BigInt(0),
        //       amount1Min: BigInt(0),
        //       recipient: accountAddress,
        //       deadline: deadline,
        //     },
        //   ],
        // });
      } catch (e) {
        console.log(e);
      }
    },
    [accountAddress, deadline, publicClient, tokenA, tokenB, walletClient],
  );

  return {
    handleTokenAChange,
    handleTokenBChange,
    handleAmountAChange,
    handleAmountBChange,
    handleAddLiquidity,
  };
}
