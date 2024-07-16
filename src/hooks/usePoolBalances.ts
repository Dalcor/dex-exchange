import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { Address } from "viem";
import { useAccount, useBalance } from "wagmi";

import { chainToApolloClient } from "@/graphql/thegraph/apollo";
import { DexChainId } from "@/sdk_hybrid/chains";
import { FeeAmount } from "@/sdk_hybrid/constants";
import { Token } from "@/sdk_hybrid/entities/token";
import { useComputePoolAddressDex } from "@/sdk_hybrid/utils/computePoolAddress";
export const PoolDataDocument = gql`
  query PoolDataQuery($id: String) {
    pool(id: $id) {
      totalValueLockedToken0
      totalValueLockedToken1
    }
  }
`;

export const usePoolBalances = ({
  tokenA,
  tokenB,
}: {
  tokenA: Token | undefined;
  tokenB: Token | undefined;
}) => {
  const { poolAddress } = useComputePoolAddressDex({
    tokenA,
    tokenB,
    tier: FeeAmount.MEDIUM,
  });

  console.log("POOL ADDRESS");
  console.log(poolAddress);

  const { data: erc20BalanceToken0 } = useBalance({
    address: poolAddress,
    token: tokenA ? tokenA.address0 : undefined,
  });

  const { data: erc223BalanceToken0 } = useBalance({
    address: poolAddress,
    token: tokenA ? tokenA.address1 : undefined,
  });

  const { data: erc20BalanceToken1 } = useBalance({
    address: poolAddress,
    token: tokenB ? tokenB.address0 : undefined,
  });

  const { data: erc223BalanceToken1 } = useBalance({
    address: poolAddress,
    token: tokenB ? tokenB.address1 : undefined,
  });
  //
  // const { data: erc20BalanceToken0 } = _erc20BalanceToken0;
  // console.log(_erc20BalanceToken0);

  return { erc20BalanceToken0, erc223BalanceToken0, erc20BalanceToken1, erc223BalanceToken1 };

  // const apolloClient = chainToApolloClient[chainId];
  //
  // return useQuery<any, any>(PoolDataDocument, {
  //   variables: {
  //     id: poolAddress,
  //   },
  //   pollInterval: 30000,
  //   client: apolloClient,
  // });
};
