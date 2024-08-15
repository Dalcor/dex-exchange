import { useLazyQuery } from "@apollo/client";
import gql from "graphql-tag";

import useAutoListingApolloClient from "@/hooks/useAutoListingApolloClient";

const query = gql`
  query AutoListings($first: Int!, $addresses: [String!]) {
    autoListings(first: 5) {
      id
      owner
      name
      url
      pricesDetail {
        id
        feeTokenAddress {
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
  const [getAutoListings] = useLazyQuery(query, { client });
}
