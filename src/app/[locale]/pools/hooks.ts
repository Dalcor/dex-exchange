import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { Address } from "viem";

import { chainToApolloClient } from "@/graphql/thegraph/apollo";
import { DexChainId } from "@/sdk_hybrid/chains";

export const PoolsDataDocument = gql`
  query PoolsDataQuery(
    $skip: Int!
    $first: Int!
    $orderDirection: OrderDirection
    $token0: String
    $where: Pool_filter
  ) {
    pools(
      where: $where
      orderBy: txCount
      orderDirection: $orderDirection
      first: $first
      skip: $skip
    ) {
      feeTier
      liquidity
      txCount
      id
      totalValueLockedUSD
      totalValueLockedETH
      volumeUSD
      token1 {
        id
        name
        symbol
        addressERC223
        totalValueLocked
      }
      token0 {
        id
        name
        symbol
        addressERC223
        totalValueLocked
      }
      poolDayData(first: 1) {
        volumeUSD
        date
      }
    }
  }
`;
export const PoolDataDocument = gql`
  query PoolDataQuery($id: String) {
    pool(id: $id) {
      feeTier
      liquidity
      txCount
      id
      totalValueLockedUSD
      totalValueLockedETH
      volumeUSD
      feesUSD
      token1 {
        id
        name
        symbol
        addressERC223
        totalValueLocked
      }
      token0 {
        id
        name
        symbol
        addressERC223
        totalValueLocked
      }
      poolDayData(first: 1) {
        date
        feesUSD
        volumeUSD
      }
    }
  }
`;

export function usePoolsData({
  skip = 0,
  first = 1000,
  orderDirection,
  chainId,
  filter,
}: {
  skip?: number;
  first?: number;
  orderDirection?: "desc" | "asc";
  chainId: DexChainId;
  filter?: {
    token0Address?: Address;
    token1Address?: Address;
  };
}) {
  const apolloClient = chainToApolloClient[chainId];

  return useQuery<any, any>(PoolsDataDocument, {
    variables: {
      skip,
      first,
      orderDirection,
      where: {
        token0_: filter?.token0Address ? { id: filter.token0Address.toLowerCase() } : undefined,
        token1_: filter?.token1Address ? { id: filter.token1Address.toLowerCase() } : undefined,
      },
    },
    skip: !apolloClient,
    pollInterval: 30000,
    client: apolloClient || chainToApolloClient[DexChainId.SEPOLIA],
  });
}

export const usePoolData = ({
  poolAddress,
  chainId,
}: {
  poolAddress: Address;
  chainId: DexChainId;
}) => {
  const apolloClient = chainToApolloClient[chainId];

  return useQuery<any, any>(PoolDataDocument, {
    variables: {
      id: poolAddress,
    },
    pollInterval: 30000,
    skip: !apolloClient,
    client: apolloClient || chainToApolloClient[DexChainId.SEPOLIA],
  });
};
