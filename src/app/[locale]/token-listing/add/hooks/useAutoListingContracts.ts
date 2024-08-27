import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { Address } from "viem";

import useAutoListingApolloClient from "@/hooks/useAutoListingApolloClient";

const query = gql`
  query AutoListings($first: Int!) {
    autoListings(first: $first) {
      id
      owner
      name
      url
      totalTokens
      lastUpdated
      pricesDetail {
        id
        feeTokenAddress {
          id
          name
          symbol
          address
          decimals
          inConverter
        }
        price
      }
      tokens {
        token {
          addressERC20
          addressERC223
          decimals
          id
          name
          symbol
        }
      }
    }
  }
`;

export default function useAutoListingContracts() {
  const client = useAutoListingApolloClient();
  const autoListings = useQuery(query, {
    client,
    variables: {
      first: 10,
    },
  });

  return autoListings;
}

export function useAutoListingContract(address: Address | undefined) {
  const listings = useAutoListingContracts();

  console.log(listings);
  console.log(address);
  if (!address) {
    return;
  }

  return listings.data?.autoListings.find((l: any) => l.id.toLowerCase() === address.toLowerCase());
}
