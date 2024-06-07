import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { Address } from "viem";

import { Check, OtherListCheck, Rate, TrustRateCheck } from "@/components/badges/TrustBadge";
import { db, TokenList, TokenListId } from "@/db/db";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { DexChainId } from "@/sdk_hybrid/chains";
import { Token } from "@/sdk_hybrid/entities/token";
import { usePinnedTokensStore } from "@/stores/usePinnedTokensStore";

export async function fetchTokenList(url: string) {
  const data = await fetch(url);
  return await data.json();
}

function getDefaultListCheckResult(
  token: Token,
  tokenLists: TokenList[],
  chainId: DexChainId,
): Pick<Rate, Check.DEFAULT_LIST> {
  const defaultTokenList = tokenLists.find((t) => t.id === `default-${chainId}`);

  const isTokenInDefaultList =
    defaultTokenList && defaultTokenList.list.tokens.find((t) => t.address0 === token.address0);
  return {
    [Check.DEFAULT_LIST]: isTokenInDefaultList ? TrustRateCheck.TRUE : TrustRateCheck.FALSE,
  };
}

function getOtherListCheckResult(
  token: Token,
  tokenLists: TokenList[],
  chainId: DexChainId,
): Pick<Rate, Check.OTHER_LIST> | undefined {
  if (tokenLists.length === 1) {
    return;
  }

  let timesTokenFoundInAllLists = 0;

  tokenLists.forEach((tokenList) => {
    if (
      tokenList.list.tokens.find(
        (t) =>
          t.address0 === token.address0 && t.address1 === token.address1 && t.name === token.name,
      )
    ) {
      timesTokenFoundInAllLists++;
    }
  });

  if (timesTokenFoundInAllLists > tokenLists.length / 2) {
    return { [Check.OTHER_LIST]: OtherListCheck.FOUND_IN_MORE_THAN_A_HALF };
  }

  if (timesTokenFoundInAllLists >= 2) {
    return { [Check.OTHER_LIST]: OtherListCheck.FOUND_IN_ONE };
  }

  return { [Check.OTHER_LIST]: OtherListCheck.NOT_FOUND };
}

function getSameNameInDefaultListCheckResult(
  token: Token,
  tokenLists: TokenList[],
  chainId: DexChainId,
): Pick<Rate, Check.SAME_NAME_IN_DEFAULT_LIST> {
  const defaultTokenList = tokenLists.find((t) => t.id === `default-${chainId}`);

  if (defaultTokenList) {
    const isDifferentTokenWithSameNameInDefaultList = defaultTokenList.list.tokens.find(
      (t) => t.address0 !== token.address0 && t.name === token.name,
    );

    if (isDifferentTokenWithSameNameInDefaultList) {
      return { [Check.SAME_NAME_IN_DEFAULT_LIST]: TrustRateCheck.TRUE };
    }
  }

  return {
    [Check.SAME_NAME_IN_DEFAULT_LIST]: TrustRateCheck.FALSE,
  };
}

function getSameNameInOtherListsCheckResult(
  token: Token,
  tokenLists: TokenList[],
  chainId: DexChainId,
): Pick<Rate, Check.SAME_NAME_IN_OTHER_LIST> | undefined {
  const tokensWithSameAddress: Token[] = [];
  const defaultTokenList = tokenLists.find((t) => t.id === `default-${chainId}`);
  if (
    defaultTokenList?.list.tokens.find(
      (t) => t.address0 === token.address0 && t.name === token.name,
    )
  ) {
    return;
  }

  const otherTokenLists = tokenLists.filter((t) => t.id !== `default-${chainId}`);

  otherTokenLists.map((otherTokenList) => {
    const tokenWithSameAddress = otherTokenList.list.tokens.find(
      (t) => t.address0 === token.address0,
    );
    if (tokenWithSameAddress) {
      tokensWithSameAddress.push(tokenWithSameAddress);
    }
  });

  const isDifferentTokenWithSameNameInOtherList = tokensWithSameAddress.find(
    (t) => t.name !== token.name,
  );

  if (isDifferentTokenWithSameNameInOtherList) {
    return { [Check.SAME_NAME_IN_OTHER_LIST]: TrustRateCheck.TRUE };
  }

  return {
    [Check.SAME_NAME_IN_OTHER_LIST]: TrustRateCheck.FALSE,
  };
}

function getERC223VersionExistsCheckResult(token: Token): Pick<Rate, Check.ERC223_VERSION_EXIST> {
  if (token.address1) {
    return { [Check.ERC223_VERSION_EXIST]: TrustRateCheck.TRUE };
  }

  return {
    [Check.ERC223_VERSION_EXIST]: TrustRateCheck.FALSE,
  };
}

function getTokenRate(token: Token, tokenLists: TokenList[], chainId: DexChainId): Rate {
  const defaultListCheck = getDefaultListCheckResult(token, tokenLists, chainId);
  const otherListCheck = getOtherListCheckResult(token, tokenLists, chainId);
  const sameNameInDefaultListCheck = getSameNameInDefaultListCheckResult(
    token,
    tokenLists,
    chainId,
  );
  const sameNameInOtherListsCheck = getSameNameInOtherListsCheckResult(token, tokenLists, chainId);
  const erc223VersionExists = getERC223VersionExistsCheckResult(token);

  return {
    ...defaultListCheck,
    ...otherListCheck,
    ...sameNameInDefaultListCheck,
    ...sameNameInOtherListsCheck,
    ...erc223VersionExists,
  };
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
  const chainId = useCurrentChainId();

  const pinnedTokens = usePinnedTokensStore((s) => s.tokens?.[chainId] || []);

  return useMemo(() => {
    if (tokenLists && tokenLists.length >= 1) {
      const inspect = (...arrays: TokenList[]) => {
        // const duplicates = [];
        const map = new Map<Address, Token>();

        const fill = (array: Token[], id: TokenListId) =>
          array.forEach((item) => {
            const lowercaseAddress = item.address0.toLowerCase() as Address;

            const rate = getTokenRate(item, tokenLists, item.chainId);

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
                rate,
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

      const _t = inspect(...tokensArrays);

      const pinned = _t.filter((t) => pinnedTokens.includes(t.address0));
      const unpinned = _t.filter((t) => !pinnedTokens.includes(t.address0));

      // Sort pinned tokens according to the order in pinnedTokens array
      const sortedPinned = pinned.sort((a, b) => {
        return pinnedTokens.indexOf(b.address0) - pinnedTokens.indexOf(a.address0);
      });

      return [...sortedPinned, ...unpinned];
    }

    const tokens =
      tokenLists
        ?.filter((list) => list.enabled)
        .map((l) => l.list.tokens)
        .flat() || [];

    const pinned = tokens.filter((t) => pinnedTokens.includes(t.address0));
    const unpinned = tokens.filter((t) => !pinnedTokens.includes(t.address0));

    // Sort pinned tokens according to the order in pinnedTokens array
    const sortedPinned = pinned.sort((a, b) => {
      return pinnedTokens.indexOf(b.address0) - pinnedTokens.indexOf(a.address0);
    });

    return [...sortedPinned, ...unpinned];
  }, [pinnedTokens, tokenLists]);
}
