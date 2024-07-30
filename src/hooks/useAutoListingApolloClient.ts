import { ApolloClient, ApolloLink, concat, HttpLink, InMemoryCache } from "@apollo/client";
import { useMemo } from "react";

import useCurrentChainId from "@/hooks/useCurrentChainId";
import { DexChainId } from "@/sdk_hybrid/chains";

const autoListingUrlMap: Record<DexChainId, string> = {
  [DexChainId.SEPOLIA]:
    "https://api.studio.thegraph.com/proxy/56540/dex223-auto-listing-sepolia/version/latest/",
  [DexChainId.BSC_TESTNET]:
    "https://api.studio.thegraph.com/proxy/56540/dex223-auto-listing-chapel/version/latest/",
  [DexChainId.EOS_TESTNET]:
    "https://api.studio.thegraph.com/proxy/56540/dex223-auto-listing-chapel/version/latest/", //TODO: update  for real
};

export default function useAutoListingApolloClient() {
  const chainId = useCurrentChainId();

  const authMiddleware = useMemo(() => {
    return new ApolloLink((operation, forward) => {
      operation.setContext(() => ({
        uri: autoListingUrlMap[chainId],
      }));

      return forward(operation);
    });
  }, [chainId]);

  return useMemo(() => {
    return new ApolloClient({
      cache: new InMemoryCache(),
      link: concat(
        authMiddleware,
        new HttpLink({
          uri: autoListingUrlMap[chainId],
        }),
      ),
    });
  }, [authMiddleware, chainId]);
}
