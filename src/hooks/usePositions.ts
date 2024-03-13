import { useMemo } from "react";
import { Address } from "viem";
import { useAccount, useReadContract, UseReadContractReturnType, useReadContracts } from "wagmi";

import { NONFUNGIBLE_POSITION_MANAGER_ABI } from "@/config/abis/nonfungiblePositionManager";
import { nonFungiblePositionManagerAddress } from "@/config/contracts";
import { FeeAmount } from "@/sdk";

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
