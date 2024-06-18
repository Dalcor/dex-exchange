import { useMemo } from "react";
import { useReadContracts } from "wagmi";

import { POOL_STATE_ABI } from "@/config/abis/poolState";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { FeeAmount } from "@/sdk_hybrid/constants";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { Pool } from "@/sdk_hybrid/entities/pool";
import { Token } from "@/sdk_hybrid/entities/token";
import {
  getPoolAddressKey,
  useComputePoolAddressesDex,
} from "@/sdk_hybrid/utils/computePoolAddress";
import { usePoolsStore } from "@/stores/usePoolsStore";

import useDeepEffect from "./useDeepEffect";
import useDeepMemo from "./useDeepMemo";

export enum PoolState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export type PoolParams = {
  currencyA: Currency | undefined;
  currencyB: Currency | undefined;
  tier: FeeAmount | undefined;
};

export type PoolsParams = PoolParams[];

type UsePoolsResult = [PoolState, Pool | null][];

// TODO: mb we need add additional logic to update pool data on liquidity data changes
// TODO: mb we need to add loading state
export const usePools = (poolsParams: PoolsParams): UsePoolsResult => {
  const { pools, addPool } = usePoolsStore();
  const chainId = useCurrentChainId();

  const poolTokens: ({ token0: Token; token1: Token; tier: FeeAmount } | undefined)[] =
    useMemo(() => {
      if (!chainId) return [...Array(poolsParams.length)];

      return poolsParams.map(({ currencyA, currencyB, tier }) => {
        if (!currencyA || !currencyB || !tier) {
          return undefined;
        }
        const tokenA = currencyA.wrapped;
        const tokenB = currencyB.wrapped;
        if (tokenA.equals(tokenB)) return undefined;
        return {
          token0: tokenA.sortsBefore(tokenB) ? tokenA : tokenB,
          token1: tokenA.sortsBefore(tokenB) ? tokenB : tokenA,
          tier,
        };
      });
    }, [chainId, poolsParams]);

  const poolAddressesParams = useMemo(() => {
    return poolTokens.map((poolToken) => {
      if (!poolToken)
        return {
          tokenA: undefined,
          tokenB: undefined,
          tier: undefined,
        };
      const { token0, token1, tier } = poolToken;
      return {
        tokenA: token0,
        tokenB: token1,
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

  useDeepEffect(() => {
    poolTokens.forEach((tokens, index) => {
      if (!tokens || slot0Loading || liquidityLoading || !chainId) return;
      if (!slot0Data || slot0Data[index].error) return;
      if (!liquidityData || liquidityData[index].error) return;
      if (!slot0Data[index]) return;
      if (!liquidityData[index]) return;
      const [sqrtPriceX96, tick] = slot0Data[index].result as [bigint, number];
      if (!sqrtPriceX96 || sqrtPriceX96 === BigInt(0)) return [PoolState.NOT_EXISTS, null];

      const { token0, token1, tier } = tokens;

      const key = getPoolAddressKey({
        addressTokenA: token0.address0,
        addressTokenB: token1.address0,
        chainId,
        tier,
      });

      const existedPool = pools[key];
      if (existedPool) return;

      const liquidity = liquidityData[index].result as bigint;
      try {
        const newPool = new Pool(
          token0,
          token1,
          tier,
          sqrtPriceX96.toString(),
          liquidity.toString(),
          tick,
        );
        addPool(key, newPool);
        return [PoolState.EXISTS, newPool];
      } catch (error) {
        console.error("Error when constructing the pool", error);
        return [PoolState.NOT_EXISTS, null];
      }
    });
  }, [
    poolsParams,
    poolTokens,
    slot0Data,
    liquidityData,
    slot0Loading,
    liquidityLoading,
    pools,
    addPool,
    chainId,
  ]);

  //
  const poolKeys = useDeepMemo(() => {
    return poolTokens.map((poolToken) => {
      if (!poolToken) return undefined;
      const { tier, token0, token1 } = poolToken;
      if (!token0 || !token1 || !tier || !chainId) return undefined;
      const key = getPoolAddressKey({
        addressTokenA: token0.address0,
        addressTokenB: token1.address0,
        chainId,
        tier,
      });
      return key;
    });
  }, [poolsParams, chainId]);

  return useDeepMemo(() => {
    return poolKeys.map((key) => {
      if (!key) return [PoolState.INVALID, null];
      const pool = pools[key];
      if (!pool) {
        return [PoolState.NOT_EXISTS, null];
      }
      return [PoolState.EXISTS, pool];
    });
  }, [pools, poolKeys]);
};

export function usePool(poolParamas: PoolParams): [PoolState, Pool | null] {
  const poolsParams = useDeepMemo(() => [poolParamas], [poolParamas]);
  return usePools(poolsParams)[0];
}
