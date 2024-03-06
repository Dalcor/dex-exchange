import JSBI from 'jsbi'
import { useEffect, useMemo, useState } from 'react'
import { Pool } from "@/sdk/entities/pool";
import { Token } from "@/sdk/entities/token";
import { BigintIsh, FeeAmount } from "@/sdk";
import { computePoolAddress } from "@/sdk/utils/computePoolAddress";
import { Currency } from "@/sdk/entities/currency";
import { useAccount } from "wagmi";
import { V3_CORE_FACTORY_ADDRESSES } from "@/sdk/addresses";
import { IIFE } from "@/functions/iife";
import { multicall } from "@wagmi/core";
import { config } from "@/config/wagmi/config";
import { POOL_STATE_ABI } from "@/config/abis/poolState";

// Classes are expensive to instantiate, so this caches the recently instantiated pools.
// This avoids re-instantiating pools as the other pools in the same request are loaded.
class PoolCache {
  // Evict after 128 entries. Empirically, a swap uses 64 entries.
  private static MAX_ENTRIES = 128

  // These are FIFOs, using unshift/pop. This makes recent entries faster to find.
  private static pools: Pool[] = []
  private static addresses: { key: string; address: string }[] = []

  static getPoolAddress(factoryAddress: string, tokenA: Token, tokenB: Token, fee: FeeAmount): string {
    if (this.addresses.length > this.MAX_ENTRIES) {
      this.addresses = this.addresses.slice(0, this.MAX_ENTRIES / 2)
    }

    const { address: addressA } = tokenA
    const { address: addressB } = tokenB
    const key = `${factoryAddress}:${addressA}:${addressB}:${fee.toString()}`
    const found = this.addresses.find((address) => address.key === key)
    if (found) return found.address

    const address = {
      key,
      address: computePoolAddress({
        factoryAddress,
        tokenA,
        tokenB,
        fee,
      }),
    }
    this.addresses.unshift(address)
    return address.address
  }

  static getPool(
    tokenA: Token,
    tokenB: Token,
    fee: FeeAmount,
    sqrtPriceX96: BigintIsh,
    liquidity: BigintIsh,
    tick: number
  ): Pool {
    if (this.pools.length > this.MAX_ENTRIES) {
      this.pools = this.pools.slice(0, this.MAX_ENTRIES / 2)
    }

    const found = this.pools.find(
      (pool) =>
        pool.token0 === tokenA &&
        pool.token1 === tokenB &&
        pool.fee === fee &&
        JSBI.EQ(pool.sqrtRatioX96, sqrtPriceX96) &&
        JSBI.EQ(pool.liquidity, liquidity) &&
        pool.tickCurrent === tick
    )
    if (found) return found

    const pool = new Pool(tokenA, tokenB, fee, sqrtPriceX96.toString(), liquidity.toString(), tick)
    this.pools.unshift(pool)
    return pool
  }
}

export enum PoolState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function usePools(
  poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][]
): [PoolState, Pool | null][] {
  const { chainId} = useAccount()

  const poolTokens: ([Token, Token, FeeAmount] | undefined)[] = useMemo(() => {
    if (!chainId) return new Array(poolKeys.length)

    return poolKeys.map(([currencyA, currencyB, feeAmount]) => {
      if (currencyA && currencyB && feeAmount) {
        const tokenA = currencyA.wrapped
        const tokenB = currencyB.wrapped
        if (tokenA.equals(tokenB)) return undefined

        return tokenA.sortsBefore(tokenB) ? [tokenA, tokenB, feeAmount] : [tokenB, tokenA, feeAmount]
      }
      return undefined
    })
  }, [chainId, poolKeys])

  const poolAddresses: (string | undefined)[] = useMemo(() => {
    const v3CoreFactoryAddress = chainId && V3_CORE_FACTORY_ADDRESSES[chainId]
    if (!v3CoreFactoryAddress) return new Array(poolTokens.length)

    return poolTokens.map((value) => value && PoolCache.getPoolAddress(v3CoreFactoryAddress, ...value))
  }, [chainId, poolTokens])

  const [slot0s, setSlot0s] = useState<any>();
  const [liquidities, setLiquidities] = useState<any>();


  useEffect(() => {
    IIFE(async () => {
      const contractsA = poolAddresses.map((address) => {
        return {
          abi: POOL_STATE_ABI,
          address: address as `0x${string}`,
          functionName: "slot0"
        }
      });

      const contractsB = poolAddresses.map((address) => {
        return {
          abi: POOL_STATE_ABI,
          address: address as `0x${string}`,
          functionName: "liquidity"
        }
      });

      const [dataSlot0s, dataLiquidities] = await Promise.all([
        multicall(config,{
          contracts: contractsA
        }),
        multicall(config,{
          contracts: contractsB,
        })
      ]);

      console.log(dataSlot0s);
      console.log(dataLiquidities);
      setSlot0s(dataSlot0s);
      setLiquidities(dataLiquidities);
    })
  }, [poolAddresses]);

  return useMemo(() => {
    return poolKeys.map((_key, index) => {
      const tokens = poolTokens[index]
      if (!tokens) return [PoolState.INVALID, null]
      const [token0, token1, fee] = tokens


      if (!slot0s || slot0s[index].error) return [PoolState.INVALID, null];
      if (!liquidities || liquidities[index].error) return [PoolState.INVALID, null];

      const [
        sqrtPriceX96,
        tick,
        observationIndex,
        observationCardinality,
        observationCardinalityNext,
        feeProtocol,
        unlocked] = slot0s[index].result;

      const liquidity = liquidities[index].result;

      // if (!slot0s[index]) return [PoolState.INVALID, null]
      // const { result: slot0, loading: slot0Loading, valid: slot0Valid } = slot0s[index]
      //
      // if (!liquidities[index]) return [PoolState.INVALID, null]
      // const { result: liquidity, loading: liquidityLoading, valid: liquidityValid } = liquidities[index]
      //
      // if (!tokens || !slot0Valid || !liquidityValid) return [PoolState.INVALID, null]
      // if (slot0Loading || liquidityLoading) return [PoolState.LOADING, null]
      // if (!slot0 || !liquidity) return [PoolState.NOT_EXISTS, null]
      // if (!slot0.sqrtPriceX96 || slot0.sqrtPriceX96.eq(0)) return [PoolState.NOT_EXISTS, null]

      try {
        const pool = PoolCache.getPool(token0, token1, fee, sqrtPriceX96, liquidity, tick)
        return [PoolState.EXISTS, pool]
      } catch (error) {
        console.error('Error when constructing the pool', error)
        return [PoolState.NOT_EXISTS, null]
      }
    })
  }, [liquidities, poolKeys, slot0s, poolTokens])
}

export function usePool(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined
): [PoolState, Pool | null] {
  const poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][] = useMemo(
    () => [[currencyA, currencyB, feeAmount]],
    [currencyA, currencyB, feeAmount]
  )

  return usePools(poolKeys)[0]
}
