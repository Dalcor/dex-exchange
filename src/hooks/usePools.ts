import JSBI from "jsbi";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useReadContracts } from "wagmi";

import { POOL_STATE_ABI } from "@/config/abis/poolState";
import { FeeAmount } from "@/sdk_hybrid/constants";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { Pool } from "@/sdk_hybrid/entities/pool";
import { Token, TokenStandard } from "@/sdk_hybrid/entities/token";
import { useComputePoolAddressesDex } from "@/sdk_hybrid/utils/computePoolAddress";
import { usePoolsStore } from "@/stores/usePoolsStore";

export enum PoolState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export type PoolKeys = [Currency | undefined, Currency | undefined, FeeAmount | undefined][];

export default function usePools(poolKeys: PoolKeys): [PoolState, Pool | null][] {
  const { chainId } = useAccount();
  const { pools, addPool } = usePoolsStore();

  const poolTokens: ([Token, Token, FeeAmount] | undefined)[] = useMemo(() => {
    if (!chainId) return [...Array(poolKeys.length)];

    return poolKeys.map(([currencyA, currencyB, feeAmount]) => {
      if (currencyA && currencyB && feeAmount) {
        const tokenA = currencyA.wrapped;
        const tokenB = currencyB.wrapped;
        if (tokenA.equals(tokenB)) return undefined;

        return tokenA.sortsBefore(tokenB)
          ? [tokenA, tokenB, feeAmount]
          : [tokenB, tokenA, feeAmount];
      }
      return undefined;
    });
  }, [chainId, poolKeys]);

  const poolAddressesParams = useMemo(() => {
    return poolTokens.map((poolToken) => {
      if (!poolToken)
        return {
          tokenA: undefined,
          tokenB: undefined,
          tier: undefined,
        };
      const [tokenA, tokenB, tier] = poolToken;
      return {
        tokenA,
        tokenB,
        tier,
      };
    });
  }, [poolTokens]);
  const poolAddresses = useComputePoolAddressesDex(poolAddressesParams);

  const slot0Contracts = useMemo(() => {
    return poolAddresses.map((address) => {
      return {
        abi: POOL_STATE_ABI,
        address: address?.address,
        functionName: "slot0",
      };
    });
  }, [poolAddresses]);

  const liquidityContracts = useMemo(() => {
    return poolAddresses.map((address) => {
      return {
        abi: POOL_STATE_ABI,
        address: address?.address,
        functionName: "liquidity",
      };
    });
  }, [poolAddresses]);

  const { data: slot0Data, isLoading: slot0Loading } = useReadContracts({
    contracts: slot0Contracts,
  });

  const { data: liquidityData, isLoading: liquidityLoading } = useReadContracts({
    contracts: liquidityContracts,
  });

  // Change useMemo to useEffect bc of WARNING addPool(poolToAdd) inside useMemo
  const [result, setResult] = useState(
    poolKeys.map(() => [PoolState.LOADING, null]) as [PoolState, Pool | null][],
  );
  useEffect(() => {
    const updatedResult: [PoolState, Pool | null][] = poolKeys.map((_key, index) => {
      const tokens = poolTokens[index];
      if (!tokens) return [PoolState.INVALID, null];
      const [token0, token1, fee] = tokens;

      if (slot0Loading || liquidityLoading) return [PoolState.LOADING, null];

      // TODO change to PoolState.INVALID
      if (!slot0Data || slot0Data[index].error) return [PoolState.NOT_EXISTS, null];
      if (!liquidityData || liquidityData[index].error) return [PoolState.NOT_EXISTS, null];

      if (!slot0Data[index]) return [PoolState.NOT_EXISTS, null];
      if (!liquidityData[index]) return [PoolState.NOT_EXISTS, null];

      const [sqrtPriceX96, tick] = slot0Data[index].result as [bigint, number];
      const liquidity = liquidityData[index].result as bigint;

      if (!sqrtPriceX96 || sqrtPriceX96 === BigInt(0)) return [PoolState.NOT_EXISTS, null];

      try {
        const pool = pools.find((pool) => {
          return (
            token0 === pool.token0 &&
            token1 === pool.token1 &&
            fee === pool.fee &&
            JSBI.EQ(pool.sqrtRatioX96, sqrtPriceX96) &&
            JSBI.EQ(pool.liquidity, liquidity) &&
            pool.tickCurrent === tick
          );
        });
        if (pool) {
          return [PoolState.EXISTS, pool];
        } else {
          const poolToAdd = new Pool(
            token0,
            token1,
            fee,
            sqrtPriceX96.toString(),
            liquidity.toString(),
            tick,
          );
          addPool(poolToAdd);
          return [PoolState.EXISTS, poolToAdd];
        }
      } catch (error) {
        console.error("Error when constructing the pool", error);
        return [PoolState.NOT_EXISTS, null];
      }
    });
    setResult(updatedResult);
  }, [
    poolKeys,
    poolTokens,
    slot0Data,
    liquidityData,
    slot0Loading,
    liquidityLoading,
    pools,
    addPool,
  ]);

  return result;
}

export function usePool(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined,
): [PoolState, Pool | null] {
  const poolKeys: PoolKeys = useMemo(
    () => [[currencyA, currencyB, feeAmount]],
    [currencyA, currencyB, feeAmount],
  );

  return usePools(poolKeys)[0];
}
