import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { Address } from "viem";

import { Check, OtherListCheck, Rate, TrustRateCheck } from "@/components/badges/TrustBadge";
import { db, TokenList, TokenListId } from "@/db/db";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { DexChainId } from "@/sdk_hybrid/chains";
import { Token } from "@/sdk_hybrid/entities/token";

export async function fetchTokenList(url: string) {
  const data = await fetch(url);
  return await data.json();
}

function getTokenRate(token: Token, tokenLists: TokenList[], chainId: DexChainId): Rate {
  const rate: Rate = {
    [Check.DEFAULT_LIST]: TrustRateCheck.FALSE,
    [Check.OTHER_LIST]: OtherListCheck.NOT_FOUND,
    [Check.SAME_NAME_IN_DEFAULT_LIST]: TrustRateCheck.FALSE,
    [Check.SAME_NAME_IN_OTHER_LIST]: TrustRateCheck.FALSE,
    [Check.ERC223_VERSION_EXIST]: TrustRateCheck.FALSE,
  };

  const defaultTokenList = tokenLists.find((t) => t.id === `default-${chainId}`);

  if (defaultTokenList && defaultTokenList.list.tokens.find((t) => t.address0 === token.address0)) {
    rate[Check.DEFAULT_LIST] = TrustRateCheck.TRUE;
  }

  if (token.address1) {
    rate[Check.ERC223_VERSION_EXIST] = TrustRateCheck.TRUE;
  }

  return rate;
}

export function useTokenLists(onlyCustom: boolean = false) {
  const chainId = useCurrentChainId();

  const allTokenLists = useLiveQuery(() => {
    return db.tokenLists.where("chainId").equals(chainId).toArray();
  }, [chainId]);

  const customTokenLists = useLiveQuery(() => {
    return db.tokenLists.where("id").equals(`custom-${chainId}`).toArray();
  }, [chainId]);

  const tokenLists = useMemo(() => {
    return onlyCustom ? customTokenLists : allTokenLists;
  }, [allTokenLists, customTokenLists, onlyCustom]);

  return useMemo(() => {
    return tokenLists?.sort((a, b) => {
      const order = (id: TokenListId | undefined) => {
        if (typeof id !== "number" && id?.includes("default")) return 0;
        if (typeof id !== "number" && id?.includes("custom")) return 1;
        if (typeof id === "number") return 2 + id; // Ensure numeric IDs come after "default" and "custom"
        return 3; // Fallback for unexpected values, pushing them to the end
      };

      return order(a.id) - order(b.id);
    });
  }, [tokenLists]);
}

export function useTokens(onlyCustom: boolean = false) {
  const tokenLists = useTokenLists(onlyCustom);

  return useMemo(() => {
    if (tokenLists && tokenLists.length >= 1) {
      const inspect = (...arrays: TokenList[]) => {
        // const duplicates = [];
        const map = new Map<Address, Token>();

        const fill = (array: Token[], id: TokenListId) =>
          array.forEach((item) => {
            const lowercaseAddress = item.address0.toLowerCase() as Address;

            map.set(
              lowercaseAddress,
              new Token(
                item.chainId,
                item.address0,
                item.address1,
                item.decimals,
                item.symbol || "Unknown",
                item.name || "Unknown",
                item?.logoURI || "/tokens/placeholder.svg",
                map.has(lowercaseAddress)
                  ? Array.from(new Set([...(map.get(lowercaseAddress)?.lists || []), id]))
                  : [id],
                getTokenRate(item, tokenLists, item.chainId),
              ),
            );
          });

        arrays.forEach((array) => fill(array.list.tokens, array.id || -1));

        return [...map.values()].sort(function (a, b) {
          if (a.lists && b.lists) {
            return b.lists.length - a.lists.length;
          }

          return 0;
        });
      };

      const tokensArrays = tokenLists.filter((list) => list.enabled);

      return inspect(...tokensArrays);
    }

    return (
      tokenLists
        ?.filter((list) => list.enabled)
        .map((l) => l.list.tokens)
        .flat() || []
    );
  }, [tokenLists]);
}
