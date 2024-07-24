import ms from "ms";
import { useMemo } from "react";
import { useBlockNumber } from "wagmi";

import { FeeAmount } from "@/sdk_hybrid/constants";
import { Token } from "@/sdk_hybrid/entities/token";

import useFeeTierDistributionQuery from "../graphql/thegraph/FeeTierDistributionQuery";
import { PoolsParams, PoolState, usePools } from "./usePools";

// maximum number of blocks past which we consider the data stale
const MAX_DATA_BLOCK_AGE = 20;

interface FeeTierDistribution {
  isLoading: boolean;
  isError: boolean;
  largestUsageFeeTier?: FeeAmount;

  // distributions as percentages of overall liquidity
  distributions?: Record<FeeAmount, number | undefined>;
}

export function useFeeTierDistribution({
  tokenA,
  tokenB,
}: {
  tokenA?: Token;
  tokenB?: Token;
}): FeeTierDistribution {
  const { isLoading, error, distributions } = usePoolTVL({
    tokenA,
    tokenB,
  });

  // fetch all pool states to determine pool state
  const poolParams: PoolsParams = useMemo(
    () => [
      { currencyA: tokenA, currencyB: tokenB, tier: FeeAmount.LOWEST },
      { currencyA: tokenA, currencyB: tokenB, tier: FeeAmount.LOW },
      { currencyA: tokenA, currencyB: tokenB, tier: FeeAmount.MEDIUM },
      { currencyA: tokenA, currencyB: tokenB, tier: FeeAmount.HIGH },
    ],
    [tokenA, tokenB],
  );
  const [poolStateVeryLow, poolStateLow, poolStateMedium, poolStateHigh] = usePools(poolParams);

  return useMemo(() => {
    if (isLoading || error || !distributions) {
      return {
        isLoading,
        isError: !!error,
        distributions,
      };
    }

    const largestUsageFeeTier = Object.keys(distributions)
      .map((d) => Number(d))
      .filter((d: FeeAmount) => distributions[d] !== 0 && distributions[d] !== undefined)
      .reduce(
        (a: FeeAmount, b: FeeAmount) => ((distributions[a] ?? 0) > (distributions[b] ?? 0) ? a : b),
        -1,
      );

    const percentages =
      !isLoading &&
      !error &&
      distributions &&
      poolStateVeryLow[0] !== PoolState.LOADING &&
      poolStateLow[0] !== PoolState.LOADING &&
      poolStateMedium[0] !== PoolState.LOADING &&
      poolStateHigh[0] !== PoolState.LOADING
        ? {
            [FeeAmount.LOWEST]:
              poolStateVeryLow[0] === PoolState.EXISTS
                ? (distributions[FeeAmount.LOWEST] ?? 0) * 100
                : undefined,
            [FeeAmount.LOW]:
              poolStateLow[0] === PoolState.EXISTS
                ? (distributions[FeeAmount.LOW] ?? 0) * 100
                : undefined,
            [FeeAmount.MEDIUM]:
              poolStateMedium[0] === PoolState.EXISTS
                ? (distributions[FeeAmount.MEDIUM] ?? 0) * 100
                : undefined,
            [FeeAmount.HIGH]:
              poolStateHigh[0] === PoolState.EXISTS
                ? (distributions[FeeAmount.HIGH] ?? 0) * 100
                : undefined,
          }
        : undefined;

    return {
      isLoading,
      isError: !!error,
      distributions: percentages,
      largestUsageFeeTier: largestUsageFeeTier === -1 ? undefined : largestUsageFeeTier,
    };
  }, [
    isLoading,
    error,
    distributions,
    poolStateVeryLow,
    poolStateLow,
    poolStateMedium,
    poolStateHigh,
  ]);
}

function usePoolTVL({ tokenA, tokenB }: { tokenA?: Token; tokenB?: Token }) {
  const { data: latestBlock } = useBlockNumber({ watch: true });
  // TODO
  const { isLoading, error, data } = useFeeTierDistributionQuery(
    tokenA?.address0,
    tokenB?.address0,
    ms(`30s`),
  );

  const { asToken0, asToken1, _meta } = data ?? {};

  return useMemo(() => {
    if (!latestBlock || !_meta || !asToken0 || !asToken1) {
      return {
        isLoading,
        error,
      };
    }

    if (latestBlock - BigInt(_meta?.block?.number ?? 0) > MAX_DATA_BLOCK_AGE) {
      console.log(`Graph stale (latest block: ${latestBlock})`);
      return {
        isLoading,
        error,
      };
    }

    const all = asToken0.concat(asToken1);

    // sum tvl for tokenA and tokenB by fee tier
    const tvlByFeeTier = all.reduce<{
      [feeAmount: number]: [number | undefined, number | undefined];
    }>(
      (acc, value) => {
        acc[value.feeTier][0] = (acc[value.feeTier][0] ?? 0) + Number(value.totalValueLockedToken0);
        acc[value.feeTier][1] = (acc[value.feeTier][1] ?? 0) + Number(value.totalValueLockedToken1);
        return acc;
      },
      {
        [FeeAmount.LOWEST]: [undefined, undefined],
        [FeeAmount.LOW]: [undefined, undefined],
        [FeeAmount.MEDIUM]: [undefined, undefined],
        [FeeAmount.HIGH]: [undefined, undefined],
      } as Record<FeeAmount, [number | undefined, number | undefined]>,
    );

    // sum total tvl for token0 and token1
    const [sumToken0Tvl, sumToken1Tvl] = Object.values(tvlByFeeTier).reduce(
      (acc: [number, number], value) => {
        acc[0] += value[0] ?? 0;
        acc[1] += value[1] ?? 0;
        return acc;
      },
      [0, 0],
    );

    // returns undefined if both tvl0 and tvl1 are undefined (pool not created)
    const mean = (
      tvl0: number | undefined,
      sumTvl0: number,
      tvl1: number | undefined,
      sumTvl1: number,
    ) =>
      tvl0 === undefined && tvl1 === undefined
        ? undefined
        : ((tvl0 ?? 0) + (tvl1 ?? 0)) / (sumTvl0 + sumTvl1) || 0;

    const distributions: Record<FeeAmount, number | undefined> = {
      [FeeAmount.LOWEST]: mean(
        tvlByFeeTier[FeeAmount.LOWEST][0],
        sumToken0Tvl,
        tvlByFeeTier[FeeAmount.LOWEST][1],
        sumToken1Tvl,
      ),
      [FeeAmount.LOW]: mean(
        tvlByFeeTier[FeeAmount.LOW][0],
        sumToken0Tvl,
        tvlByFeeTier[FeeAmount.LOW][1],
        sumToken1Tvl,
      ),
      [FeeAmount.MEDIUM]: mean(
        tvlByFeeTier[FeeAmount.MEDIUM][0],
        sumToken0Tvl,
        tvlByFeeTier[FeeAmount.MEDIUM][1],
        sumToken1Tvl,
      ),
      [FeeAmount.HIGH]: mean(
        tvlByFeeTier[FeeAmount.HIGH][0],
        sumToken0Tvl,
        tvlByFeeTier[FeeAmount.HIGH][1],
        sumToken1Tvl,
      ),
    };

    return {
      isLoading,
      error,
      distributions,
    };
  }, [_meta, asToken0, asToken1, isLoading, error, latestBlock]);
}
