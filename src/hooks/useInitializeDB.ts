import { useLazyQuery } from "@apollo/client";
import { useLiveQuery } from "dexie-react-hooks";
import gql from "graphql-tag";
import { useCallback, useEffect } from "react";
import { Address } from "viem";

import { db, TokenListId } from "@/db/db";
import { defaultLists } from "@/db/lists";
import { IIFE } from "@/functions/iife";
import useAutoListingApolloClient from "@/hooks/useAutoListingApolloClient";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { CORE_AUTO_LISTING_ADDRESS, FREE_AUTO_LISTING_ADDRESS } from "@/sdk_hybrid/addresses";
import { DEX_SUPPORTED_CHAINS, DexChainId } from "@/sdk_hybrid/chains";
import { Token } from "@/sdk_hybrid/entities/token";

const updatingDefault: DexChainId[] = [];
export default function useInitializeDB() {
  useAutoListingUpdater();

  useEffect(() => {
    IIFE(async () => {
      for (let i = 0; i < DEX_SUPPORTED_CHAINS.length; i++) {
        if (updatingDefault.includes(DEX_SUPPORTED_CHAINS[i])) {
          return;
        }
        updatingDefault.push(DEX_SUPPORTED_CHAINS[i]);
        const defaultList = await db.tokenLists.get(`default-${DEX_SUPPORTED_CHAINS[i]}`);

        if (!defaultList) {
          console.log("sdd");
          await db.tokenLists.add({
            id: `default-${DEX_SUPPORTED_CHAINS[i]}`,
            list: defaultLists[DEX_SUPPORTED_CHAINS[i]],
            chainId: DEX_SUPPORTED_CHAINS[i],
            enabled: true,
          });
        } else {
          const { major, minor, patch } = defaultList.list.version;
          const {
            major: _major,
            minor: _minor,
            patch: _patch,
          } = defaultLists[DEX_SUPPORTED_CHAINS[i]].version;
          if (
            major < _major ||
            (major === major && minor < _minor) ||
            (major === _major && minor === _minor && patch < _patch)
          ) {
            await (db.tokenLists as any).update(`default-${DEX_SUPPORTED_CHAINS[i]}`, {
              list: defaultLists[DEX_SUPPORTED_CHAINS[i]],
              enabled: true,
            });
          }
        }
      }
    });
  }, []);
}

const query = gql`
  query AutoListings($first: Int!, $addresses: [String!]) {
    autoListings(first: $first, where: { id_in: $addresses }) {
      id
      owner
      name
      lastUpdated
      totalTokens
      tokens {
        timestamp
        token {
          addressERC20
          addressERC223
          name
          symbol
          decimals
          numberAdditions
        }
      }
    }
  }
`;

const queryLastUpdated = gql`
  query AutoListings($first: Int!, $addresses: [String!]) {
    autoListings(first: $first, where: { id_in: $addresses }) {
      id
      lastUpdated
      totalTokens
    }
  }
`;

export function useAutoListingUpdater() {
  const chainId = useCurrentChainId();
  const allAutoListings = useLiveQuery(() =>
    db.tokenLists
      .where("chainId")
      .equals(chainId)
      .filter((list) => Boolean(list.autoListingContract))
      .toArray(),
  );

  const client = useAutoListingApolloClient();

  const [checkLastUpdated] = useLazyQuery(queryLastUpdated, { client });
  const [getAutoListings] = useLazyQuery(query, { client });

  const getMeta = useCallback(
    (address: Address): [TokenListId, string] => {
      if (address.toLowerCase() === CORE_AUTO_LISTING_ADDRESS[chainId].toLowerCase()) {
        return [`core-autolisting-${chainId}`, "DEX223 Core Autolisting"];
      }

      if (address.toLowerCase() === FREE_AUTO_LISTING_ADDRESS[chainId].toLowerCase()) {
        return [`free-autolisting-${chainId}`, "DEX223 Free Autolisting"];
      }

      return [
        allAutoListings?.find((list) => list.autoListingContract === address)?.id,
        `Autolisting ${address.toLowerCase().slice(0, 6)}...${address.toLowerCase().slice(-6)}`,
      ];
    },
    [allAutoListings, chainId],
  );

  useEffect(() => {
    IIFE(async () => {
      if (!allAutoListings) {
        return;
      }

      const addressesToActualize = new Set<string>([]);

      // we use `as Address` here because allAutoListings already filtered by truthy autoListingContract value
      const allAutoListingContracts = allAutoListings.map((list) =>
        (list.autoListingContract as Address).toLowerCase(),
      );

      if (!allAutoListingContracts.includes(CORE_AUTO_LISTING_ADDRESS[chainId].toLowerCase())) {
        addressesToActualize.add(CORE_AUTO_LISTING_ADDRESS[chainId].toLowerCase());
      }

      if (!allAutoListingContracts.includes(FREE_AUTO_LISTING_ADDRESS[chainId].toLowerCase())) {
        addressesToActualize.add(FREE_AUTO_LISTING_ADDRESS[chainId].toLowerCase());
      }

      const lastUpdatedResult = await checkLastUpdated({
        variables: {
          addresses: allAutoListingContracts,
          first: allAutoListingContracts.length,
        },
      });

      lastUpdatedResult.data?.autoListings.forEach((autoListingInfo: any) => {
        const currentListing = allAutoListings.find(
          (listing) =>
            listing.autoListingContract?.toLowerCase() === autoListingInfo.id.toLowerCase(),
        );
        if (
          !currentListing?.lastUpdated ||
          currentListing?.lastUpdated < autoListingInfo.lastUpdated
        ) {
          addressesToActualize.add(autoListingInfo.id.toLowerCase());
        }
      });

      if (!Array.from(addressesToActualize).length) {
        console.log("All autolistings are updated");
        return;
      }

      console.log("Updating autolistings...");

      const autoListingsToUpdate = await getAutoListings({
        variables: {
          addresses: Array.from(addressesToActualize),
          first: Array.from(addressesToActualize).length,
        },
      });

      const resultData = autoListingsToUpdate.data?.autoListings;

      if (resultData && resultData.length) {
        for (let i = 0; i < resultData.length; i++) {
          const [id, name] = getMeta(resultData[i].id);

          await db.tokenLists.put(
            {
              id,
              autoListingContract: resultData[i].id.toLowerCase(),
              lastUpdated: resultData[i].lastUpdated,
              list: {
                logoURI: "/token-list-placeholder.svg",
                name,
                version: {
                  major: 0,
                  minor: 0,
                  patch: 1,
                },
                tokens: resultData[i].tokens.map(({ token }: any) => {
                  console.log(token.decimals);
                  return new Token(
                    chainId,
                    token.addressERC20,
                    token.addressERC223,
                    +token.decimals,
                    token.symbol,
                    token.name,
                    "/tokens/placeholder.svg",
                  );
                }),
              },
              chainId,
              enabled: true,
            },
            id,
          );
        }
      }
    });
  }, [allAutoListings, chainId, checkLastUpdated, getAutoListings, getMeta]);
}
