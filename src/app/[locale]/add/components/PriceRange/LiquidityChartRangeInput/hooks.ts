import JSBI from "jsbi";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "wagmi";

import { useAllV3TicksQuery } from "@/graphql/thegraph/__generated__/types-and-hooks";
import { TickData, Ticks } from "@/graphql/thegraph/AllV3TicksQuery";
import { chainToApolloClient } from "@/graphql/thegraph/apollo";
import { PoolState, usePool } from "@/hooks/usePools";
import { FACTORY_ADDRESS } from "@/sdk_hybrid/addresses";
import { DexChainId } from "@/sdk_hybrid/chains";
import { FeeAmount, TICK_SPACINGS } from "@/sdk_hybrid/constants";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { Price } from "@/sdk_hybrid/entities/fractions/price";
import { Pool } from "@/sdk_hybrid/entities/pool";
import { Token, TokenStandard } from "@/sdk_hybrid/entities/token";
import { useComputePoolAddressDex } from "@/sdk_hybrid/utils/computePoolAddress";
import { tickToPrice } from "@/sdk_hybrid/utils/priceTickConversions";

import { useTokensStandards } from "../../../stores/useAddLiquidityAmountsStore";
import MockData from "./mockData.json";
import { ChartEntry } from "./types";

// Computes the numSurroundingTicks above or below the active tick.
export default function computeSurroundingTicks(
  token0: Token,
  token1: Token,
  activeTickProcessed: TickProcessed,
  // sortedTickData: Ticks,
  sortedTickData: any[],
  pivot: number,
  ascending: boolean,
): TickProcessed[] {
  let previousTickProcessed: TickProcessed = {
    ...activeTickProcessed,
  };
  // Iterate outwards (either up or down depending on direction) from the active tick,
  // building active liquidity for every tick.
  let processedTicks: TickProcessed[] = [];
  for (
    let i = pivot + (ascending ? 1 : -1);
    ascending ? i < sortedTickData.length : i >= 0;
    ascending ? i++ : i--
  ) {
    const tick = Number(sortedTickData[i].tick);
    const sdkPrice = tickToPrice(token0, token1, tick);
    const currentTickProcessed: TickProcessed = {
      liquidityActive: previousTickProcessed.liquidityActive,
      tick,
      liquidityNet: JSBI.BigInt(sortedTickData[i].liquidityNet),
      price0: sdkPrice.toFixed(PRICE_FIXED_DIGITS),
      sdkPrice,
    };

    // Update the active liquidity.
    // If we are iterating ascending and we found an initialized tick we immediately apply
    // it to the current processed tick we are building.
    // If we are iterating descending, we don't want to apply the net liquidity until the following tick.
    if (ascending) {
      currentTickProcessed.liquidityActive = JSBI.add(
        previousTickProcessed.liquidityActive,
        JSBI.BigInt(sortedTickData[i].liquidityNet),
      );
    } else if (!ascending && JSBI.notEqual(previousTickProcessed.liquidityNet, JSBI.BigInt(0))) {
      // We are iterating descending, so look at the previous tick and apply any net liquidity.
      currentTickProcessed.liquidityActive = JSBI.subtract(
        previousTickProcessed.liquidityActive,
        previousTickProcessed.liquidityNet,
      );
    }

    processedTicks.push(currentTickProcessed);
    previousTickProcessed = currentTickProcessed;
  }

  if (!ascending) {
    processedTicks = processedTicks.reverse();
  }

  return processedTicks;
}

// Tick with fields parsed to JSBIs, and active liquidity computed.
export interface TickProcessed {
  tick: number;
  liquidityActive: JSBI;
  liquidityNet: JSBI;
  price0: string;
  sdkPrice: Price<Token, Token>;
}

const getActiveTick = (tickCurrent: number | undefined, feeAmount: FeeAmount | undefined) =>
  tickCurrent && feeAmount
    ? Math.floor(tickCurrent / TICK_SPACINGS[feeAmount]) * TICK_SPACINGS[feeAmount]
    : undefined;

function useTicksFromSubgraph(
  currencyA: Token | undefined,
  currencyB: Token | undefined,
  feeAmount: FeeAmount | undefined,
  skip = 0,
  chainId: DexChainId,
) {
  const apolloClient = chainToApolloClient[chainId];
  const { poolAddress, poolAddressLoading } = useComputePoolAddressDex({
    tokenA: currencyA,
    tokenB: currencyB,
    tier: feeAmount,
  });

  return useAllV3TicksQuery({
    variables: { poolAddress: poolAddress?.toLowerCase(), skip },
    skip: !poolAddress,
    pollInterval: 30000,
    client: apolloClient,
  });
}

const MAX_THE_GRAPH_TICK_FETCH_VALUE = 1000;
// Fetches all ticks for a given pool
function useAllV3Ticks(
  currencyA: Token | undefined,
  currencyB: Token | undefined,
  feeAmount: FeeAmount | undefined,
  chainId: DexChainId,
): {
  isLoading: boolean;
  error: unknown;
  ticks?: TickData[];
} {
  const [skipNumber, setSkipNumber] = useState(0);
  const [subgraphTickData, setSubgraphTickData] = useState<Ticks>([]);
  const {
    data,
    error,
    loading: isLoading,
  } = useTicksFromSubgraph(currencyA, currencyB, feeAmount, skipNumber, chainId);

  useEffect(() => {
    if (data?.ticks.length) {
      setSubgraphTickData((tickData) => [...tickData, ...data.ticks]);
      if (data.ticks.length === MAX_THE_GRAPH_TICK_FETCH_VALUE) {
        setSkipNumber((skipNumber) => skipNumber + MAX_THE_GRAPH_TICK_FETCH_VALUE);
      }
    }
  }, [data?.ticks]);

  return {
    isLoading: isLoading || data?.ticks.length === MAX_THE_GRAPH_TICK_FETCH_VALUE,
    error,
    ticks: subgraphTickData,
  };
}

const PRICE_FIXED_DIGITS = 8;

export function usePoolActiveLiquidity(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined,
  chainId?: DexChainId,
): {
  isLoading: boolean;
  error: any;
  currentTick?: number;
  activeTick?: number;
  liquidity?: JSBI;
  sqrtPriceX96?: JSBI;
  data?: TickProcessed[];
} {
  const { chainId: accountChainId } = useAccount();
  const defaultChainId = accountChainId ?? DexChainId.SEPOLIA;

  const pool = usePool(currencyA?.wrapped, currencyB?.wrapped, feeAmount);

  const liquidity = pool[1]?.liquidity;
  const sqrtPriceX96 = pool[1]?.sqrtRatioX96;

  const currentTick = pool[1]?.tickCurrent;
  // Find nearest valid tick for pool in case tick is not initialized.
  const activeTick = useMemo(() => getActiveTick(currentTick, feeAmount), [currentTick, feeAmount]);

  const { isLoading, error, ticks }: any = useAllV3Ticks(
    currencyA?.wrapped,
    currencyB?.wrapped,
    feeAmount,
    chainId ?? defaultChainId,
  );

  return useMemo(() => {
    if (
      !currencyA ||
      !currencyB ||
      activeTick === undefined ||
      pool[0] !== PoolState.EXISTS ||
      !ticks ||
      ticks.length === 0 ||
      isLoading
    ) {
      return {
        isLoading: isLoading || pool[0] === PoolState.LOADING,
        error,
        activeTick,
        data: undefined,
      };
    }

    const token0 = currencyA?.wrapped;
    const token1 = currencyB?.wrapped;

    // find where the active tick would be to partition the array
    // if the active tick is initialized, the pivot will be an element
    // if not, take the previous tick as pivot
    const pivot = ticks.findIndex(({ tick }: any) => tick > activeTick) - 1;

    if (pivot < 0) {
      // consider setting a local error
      console.error("TickData pivot not found");
      return {
        isLoading,
        error,
        activeTick,
        data: undefined,
      };
    }

    const sdkPrice = tickToPrice(token0, token1, activeTick);
    const activeTickProcessed: TickProcessed = {
      liquidityActive: JSBI.BigInt(pool[1]?.liquidity ?? 0),
      tick: activeTick,
      liquidityNet:
        Number(ticks[pivot].tick) === activeTick
          ? JSBI.BigInt(ticks[pivot].liquidityNet)
          : JSBI.BigInt(0),
      price0: sdkPrice.toFixed(PRICE_FIXED_DIGITS),
      sdkPrice,
    };

    const subsequentTicks = computeSurroundingTicks(
      token0,
      token1,
      activeTickProcessed,
      ticks,
      pivot,
      true,
    );

    const previousTicks = computeSurroundingTicks(
      token0,
      token1,
      activeTickProcessed,
      ticks,
      pivot,
      false,
    );

    const ticksProcessed = previousTicks.concat(activeTickProcessed).concat(subsequentTicks);

    return {
      isLoading,
      error,
      currentTick,
      activeTick,
      liquidity,
      sqrtPriceX96,
      data: ticksProcessed,
    };
  }, [
    currencyA,
    currencyB,
    activeTick,
    pool,
    ticks,
    isLoading,
    error,
    currentTick,
    liquidity,
    sqrtPriceX96,
  ]);
}

export function useDensityChartData({
  currencyA,
  currencyB,
  feeAmount,
}: {
  currencyA?: Currency;
  currencyB?: Currency;
  feeAmount?: FeeAmount;
}) {
  const { isLoading, error, data } = usePoolActiveLiquidity(currencyA, currencyB, feeAmount);

  const formatData = useCallback(() => {
    if (!data?.length) {
      return undefined;
    }

    const newData: ChartEntry[] = [];

    for (let i = 0; i < data.length; i++) {
      const t: TickProcessed = data[i];

      const chartEntry = {
        activeLiquidity: parseFloat(t.liquidityActive.toString()),
        price0: parseFloat(t.price0),
      };

      if (chartEntry.activeLiquidity > 0) {
        newData.push(chartEntry);
      }
    }

    return newData;
  }, [data]);

  return useMemo(() => {
    return {
      isLoading,
      error,
      formattedData: !isLoading ? formatData() : undefined,
      // formattedData: MockData,
    };
  }, [isLoading, error, formatData]);
}

// modified from https://usehooks.com/usePrevious/
export function usePrevious<T>(value: T): T | undefined {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef<T>();

  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

type Nullish<T> = T | null | undefined;
export const DEFAULT_LOCALE = "en-US";

// Used to format floats representing percent change with fixed decimal places
export function formatDelta(delta: Nullish<number>, locale: string = DEFAULT_LOCALE) {
  if (delta === null || delta === undefined || delta === Infinity || isNaN(delta)) {
    return "-";
  }

  return `${Number(Math.abs(delta).toFixed(2)).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  })}%`;
}
