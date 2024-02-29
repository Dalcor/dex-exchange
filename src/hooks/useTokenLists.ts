import { useEffect, useMemo, useState } from "react";
import { TokenList } from "@/config/types/TokenList";
import { IIFE } from "@/functions/iife";
import { WrappedToken } from "@/config/types/WrappedToken";
import { ExternalTokenList, LocalTokenList, SavedTokenList, useTokenListsStore } from "@/stores/useTokenListsStore";
import { useAccount } from "wagmi";
import { AvailableChains } from "@/components/dialogs/stores/useConnectWalletStore";
import { Address } from "viem";

export async function fetchTokenList(url: string) {
  const data = await fetch(url);
  console.log(data);
  return await data.json();
}

let isExternal = (obj: SavedTokenList): obj is ExternalTokenList => {
  return "url" in obj;
}

let isLocal = (obj: SavedTokenList): obj is LocalTokenList => {
  return "list" in obj;
}
export function useTokenLists() {
  const { tokenLists: savedLists, toggleTokenList } = useTokenListsStore();
  const [lists, setLists] = useState<TokenList[]>([]);
  const { chainId } = useAccount();


  useEffect(() => {
    if (!chainId) {
      return;
    }
    const tokenListsFromStorage = savedLists[chainId as AvailableChains];

    const externalLists = tokenListsFromStorage.filter(isExternal);
    const localLists = tokenListsFromStorage.filter(isLocal);

    const urls = externalLists.map(list => (list).url);

    console.log("Token lists from storage");
    console.log(tokenListsFromStorage);


    IIFE(async () => {
      const promises = urls.map((url) => fetchTokenList(url));
      const results = await Promise.all(promises);

      let internalLists: TokenList[] = [];

      results.forEach((result, index) => {
        const tokenListTokens = (result.tokens as {
          address: string,
          name: string,
          symbol: string,
          decimals: string,
          chainId: string
          logoURI: string
        }[]).filter(t => +t.chainId === chainId).map(({ address, name, symbol, decimals, chainId, logoURI }) => {
          return new WrappedToken(
            address,
            name,
            symbol,
            +decimals,
            logoURI,
            +chainId
          )
        });

        const geckoList = new TokenList(
          externalLists[index].id,
          result.name,
          // "/token-lists/coingecko.png",
          result.logoURI,
          chainId,
          tokenListTokens,
          tokenListsFromStorage[index].enabled
        );

        internalLists.push(geckoList);
      });

      localLists.forEach((listItem, index) => {
        const tokens = listItem.list.tokens;

        const wrappedTokens = tokens.map((token) => new WrappedToken(
          token.address,
          token.name,
          token.symbol,
          +token.decimals,
          "/tokens/placeholder.svg",
          +token.chainId
        ));

        const geckoList = new TokenList(
          localLists[index].id,
          listItem.name,
          "/token-list-placeholder.svg",
          chainId,
          wrappedTokens,
          localLists[index].enabled
        );

        internalLists.push(geckoList);
      });

      setLists(internalLists)
    });
  }, [chainId, savedLists]);

  return {
    lists,
    toggleTokenList: (id: string) => toggleTokenList(id, chainId as AvailableChains),
    loading: !lists.length
  };
}

export function useTokens() {
  const tokenLists = useTokenLists();

  console.log("RERENDER");
  return useMemo(() => {
    if(tokenLists.lists.length > 1) {
      const inspect = (...arrays: TokenList[]) => {
        // const duplicates = [];
        const map = new Map<Address, WrappedToken>();

        const fill = (array: WrappedToken[], id: string) => array.forEach(item => {
          const lowercaseAddress = item.address.toLowerCase() as Address;

          if (map.has(lowercaseAddress)) {
            // duplicates.push(item);
            map.set(lowercaseAddress, {...item, lists: Array.from(new Set([...(map.get(lowercaseAddress)?.lists || []), id]))})
          } else {
            map.set(lowercaseAddress, { ...item, lists: [id] });
          }
        });

        arrays.forEach(array => fill(array.tokens, array.id));

        // console.log(duplicates);
        console.log();
        return [...map.values()].sort(function (a, b) {
          if(a.lists && b.lists) {
            return b.lists.length - a.lists.length;
          }

          return 0;
        });
      };

      const tokensArrays = tokenLists.lists.filter(list => list.enabled);

      return inspect(...tokensArrays);
    }

    return tokenLists.lists.filter(list => list.enabled).map((l) => l.tokens).flat();
  }, [tokenLists.lists]);
}
