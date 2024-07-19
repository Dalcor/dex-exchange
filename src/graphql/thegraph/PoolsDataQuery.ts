import gql from "graphql-tag";

gql`
  query PoolsDataQuery {
    pools {
      feeTier
      liquidity
      txCount
      id
      totalValueLockedUSD
      totalValueLockedETH
      volumeUSD
    }
  }
`;
