import { BigNumber } from "@ethersproject/bignumber";
import JSBI from "jsbi";
import { useCallback, useMemo, useState } from "react";
import { Address, formatUnits, getAbiItem } from "viem";
import {
  useAccount,
  useBlockNumber,
  usePublicClient,
  useReadContract,
  useReadContracts,
  useSimulateContract,
  useWalletClient,
  useWriteContract,
} from "wagmi";

import { ERC20_ABI } from "@/config/abis/erc20";
import { NONFUNGIBLE_POSITION_MANAGER_ABI } from "@/config/abis/nonfungiblePositionManager";
import { nonFungiblePositionManagerAddress } from "@/config/contracts";
import { WrappedToken } from "@/config/types/WrappedToken";
import { usePool } from "@/hooks/usePools";
import { useTokens } from "@/hooks/useTokenLists";
import addToast from "@/other/toast";
import { FeeAmount } from "@/sdk";
import { Currency } from "@/sdk/entities/currency";
import { CurrencyAmount } from "@/sdk/entities/fractions/currencyAmount";
import { Price } from "@/sdk/entities/fractions/price";
import { Pool } from "@/sdk/entities/pool";
import { Position } from "@/sdk/entities/position";
import { toHex } from "@/sdk/utils/calldata";
import {
  GasFeeModel,
  RecentTransactionTitleTemplate,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";

export type PositionInfo = {
  nonce: bigint;
  operator: `0x${string}`;
  token0: `0x${string}`;
  token1: `0x${string}`;
  tier: FeeAmount;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  feeGrowthInside0LastX128: bigint;
  feeGrowthInside1LastX128: bigint;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
  tokenId: bigint | undefined;
};

export function usePositionFromTokenId(tokenId: bigint) {
  const { positions, loading } = usePositionsFromTokenIds(tokenId ? [tokenId] : undefined);

  return useMemo(() => {
    return {
      loading,
      position: positions?.[0],
    };
  }, [loading, positions]);
}
export function usePositionsFromTokenIds(tokenIds: bigint[] | undefined) {
  const positionsContracts = useMemo(() => {
    if (!tokenIds) {
      return [];
    }

    return tokenIds.map((tokenId) => {
      return {
        address: nonFungiblePositionManagerAddress as Address,
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        functionName: "positions",
        args: [tokenId],
      };
    });
  }, [tokenIds]);

  const { data: positionsData, isLoading: positionsLoading } = useReadContracts({
    contracts: positionsContracts,
  });

  return useMemo(() => {
    return {
      loading: positionsLoading,
      positions: positionsData
        ?.map((pos, i) => {
          if (!pos || pos.error) {
            return undefined;
          }

          const [
            nonce,
            operator,
            token0,
            token1,
            tier,
            tickLower,
            tickUpper,
            liquidity,
            feeGrowthInside0LastX128,
            feeGrowthInside1LastX128,
            tokensOwed0,
            tokensOwed1,
          ] = pos.result as any;
          return {
            token0,
            token1,
            tier,
            tickLower,
            tickUpper,
            liquidity,
            tokenId: tokenIds?.[i],
          };
        })
        .filter((pos) => Boolean(pos)) as PositionInfo[],
    };
  }, [positionsData, positionsLoading, tokenIds]);
}
export default function usePositions() {
  const { address: account } = useAccount();

  const { data: balance, isLoading: balanceLoading } = useReadContract({
    address: nonFungiblePositionManagerAddress,
    abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
    functionName: "balanceOf",
    args: account && [account],
    query: {
      enabled: Boolean(account),
    },
  });

  const tokenIdsArgs = useMemo(() => {
    if (balance && account) {
      const tokenRequests = [];
      for (let i = 0; i < Number(balance); i++) {
        tokenRequests.push([account, i]);
      }
      return tokenRequests;
    }
    return [];
  }, [account, balance]);

  const tokenIdsContracts = useMemo(() => {
    return tokenIdsArgs.map((tokenId) => ({
      abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
      functionName: "tokenOfOwnerByIndex",
      args: tokenId,
      address: nonFungiblePositionManagerAddress as Address,
    }));
  }, [tokenIdsArgs]);

  const { data: tokenIdsData, isLoading: tokenIdsLoading } = useReadContracts({
    contracts: tokenIdsContracts,
  });

  const { positions, loading: positionsLoading } = usePositionsFromTokenIds(
    tokenIdsData
      ?.filter((value) => !!value.result && typeof value.result === "bigint")
      .map((value) => value.result as bigint),
  );

  return {
    positions,
    loading: positionsLoading || tokenIdsLoading || balanceLoading,
  };
}

export function usePositionFromPositionInfo(positionDetails: PositionInfo) {
  const tokens = useTokens();

  const tokenA = useMemo(() => {
    return tokens.find((t) => t.address === positionDetails?.token0);
  }, [positionDetails?.token0, tokens]);

  const tokenB = useMemo(() => {
    return tokens.find((t) => t.address === positionDetails?.token1);
  }, [positionDetails?.token1, tokens]);
  //
  const pool = usePool(tokenA, tokenB, positionDetails?.tier);

  return useMemo(() => {
    if (pool[1] && positionDetails) {
      return new Position({
        pool: pool[1],
        tickLower: positionDetails.tickLower,
        tickUpper: positionDetails.tickUpper,
        liquidity: JSBI.BigInt(positionDetails.liquidity.toString()),
      });
    }
  }, [pool, positionDetails]);
}

const MAX_UINT128 = BigInt(2) ** BigInt(128) - BigInt(1);

export function usePositionFees(
  pool?: Pool,
  tokenId?: bigint,
  asWETH: boolean = false,
): {
  fees: [CurrencyAmount<Currency>, CurrencyAmount<Currency>] | [undefined, undefined];
  handleCollectFees: () => void;
} {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { address, chainId } = useAccount();
  const { addRecentTransaction } = useRecentTransactionsStore();

  const result = useReadContract({
    address: nonFungiblePositionManagerAddress,
    abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
    functionName: "ownerOf",
    args: [tokenId!],
    query: {
      enabled: Boolean(tokenId),
    },
  });

  const latestBlockNumber = useBlockNumber();

  const { data: collectResult } = useSimulateContract({
    address: nonFungiblePositionManagerAddress,
    abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
    functionName: "collect",
    args: [
      {
        tokenId: tokenId!,
        recipient: result.data!,
        amount0Max: MAX_UINT128,
        amount1Max: MAX_UINT128,
      },
    ],
    query: {
      enabled: Boolean(tokenId && result.data),
    },
  });

  const { writeContract } = useWriteContract();

  const handleCollectFees = useCallback(async () => {
    if (!publicClient || !walletClient || !chainId || !address || !pool || !collectResult) {
      return;
    }

    const params = {
      address: nonFungiblePositionManagerAddress,
      abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
      functionName: "collect" as "collect",
      args: [
        {
          tokenId: tokenId!,
          recipient: result.data!,
          amount0Max: MAX_UINT128,
          amount1Max: MAX_UINT128,
        },
      ] as any,
    };

    const estimatedGas = await publicClient.estimateContractGas(params);

    const { request } = await publicClient.simulateContract({
      ...params,
      gas: estimatedGas + BigInt(30000),
    });
    const hash = await walletClient.writeContract(request);

    const nonce = await publicClient.getTransactionCount({
      address,
      blockTag: "pending",
    });

    addRecentTransaction(
      {
        hash,
        nonce,
        chainId,
        gas: {
          model: GasFeeModel.EIP1559,
          gas: estimatedGas + BigInt(30000),
          maxFeePerGas: undefined,
          maxPriorityFeePerGas: undefined,
        },
        params: {
          ...params,
          abi: [getAbiItem({ name: "collect", abi: NONFUNGIBLE_POSITION_MANAGER_ABI })],
        },
        title: {
          template: RecentTransactionTitleTemplate.COLLECT,
          symbol0: pool.token0.symbol!,
          symbol1: pool.token1.symbol!,
          amount0: CurrencyAmount.fromRawAmount(
            pool.token0,
            collectResult.result[0].toString(),
          ).toSignificant(2),
          amount1: CurrencyAmount.fromRawAmount(
            pool.token1,
            collectResult.result[1].toString(),
          ).toSignificant(2),
          logoURI0: (pool?.token0 as WrappedToken).logoURI!,
          logoURI1: (pool?.token1 as WrappedToken).logoURI!,
        },
      },
      address,
    );
  }, [
    addRecentTransaction,
    address,
    chainId,
    collectResult,
    pool,
    publicClient,
    result.data,
    tokenId,
    walletClient,
  ]);

  return {
    fees:
      pool && collectResult?.result
        ? [
            CurrencyAmount.fromRawAmount(pool.token0, collectResult.result[0].toString()),
            CurrencyAmount.fromRawAmount(pool.token1, collectResult.result[1].toString()),
          ]
        : [undefined, undefined],
    handleCollectFees,
  };
}

function getRatio(
  lower: Price<Currency, Currency>,
  current: Price<Currency, Currency>,
  upper: Price<Currency, Currency>,
) {
  try {
    if (+current < +lower) {
      return 100;
    } else if (+current > +upper) {
      return 0;
    }

    const a = Number.parseFloat(lower.toSignificant(15));
    const b = Number.parseFloat(upper.toSignificant(15));
    const c = Number.parseFloat(current.toSignificant(15));

    const ratio = Math.floor(
      (1 / ((Math.sqrt(a * b) - Math.sqrt(b * c)) / (c - Math.sqrt(b * c)) + 1)) * 100,
    );

    if (ratio < 0 || ratio > 100) {
      throw Error("Out of range");
    }

    return ratio;
  } catch {
    return undefined;
  }
}
export function usePositionPrices({
  position,
  showFirst,
}: {
  position: Position | undefined;
  showFirst: boolean;
}) {
  const minPrice = useMemo(() => {
    if (showFirst) {
      return position?.token0PriceLower.invert();
    }

    return position?.token0PriceLower;
  }, [position?.token0PriceLower, showFirst]);

  const maxPrice = useMemo(() => {
    if (showFirst) {
      return position?.token0PriceUpper.invert();
    }

    return position?.token0PriceUpper;
  }, [position?.token0PriceUpper, showFirst]);

  const currentPrice = useMemo(() => {
    if (showFirst) {
      return position?.pool.token1Price;
    }

    return position?.pool.token0Price;
  }, [position?.pool.token0Price, position?.pool.token1Price, showFirst]);

  const [minPriceString, maxPriceString, currentPriceString] = useMemo(() => {
    if (minPrice && maxPrice && currentPrice) {
      return [minPrice.toSignificant(), maxPrice.toSignificant(), currentPrice.toSignificant()];
    }

    return ["0", "0", "0"];
  }, [currentPrice, maxPrice, minPrice]);

  const ratio = useMemo(() => {
    if (minPrice && currentPrice && maxPrice) {
      return getRatio(minPrice, currentPrice, maxPrice);
    }
  }, [currentPrice, maxPrice, minPrice]);

  return {
    minPriceString,
    maxPriceString,
    currentPriceString,
    ratio,
  };
}

export function usePositionRangeStatus({ position }: { position: Position | undefined }) {
  const below =
    position?.pool && typeof position?.tickUpper === "number"
      ? position.pool.tickCurrent < position.tickLower
      : undefined;
  const above =
    position?.pool && typeof position?.tickLower === "number"
      ? position.pool.tickCurrent >= position.tickUpper
      : undefined;
  const inRange: boolean =
    typeof below === "boolean" && typeof above === "boolean" ? !below && !above : false;

  const removed = position ? JSBI.equal(position.liquidity, JSBI.BigInt(0)) : false;

  return {
    inRange,
    removed,
  };
}
