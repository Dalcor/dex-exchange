import { Address } from "viem";
import { create } from "zustand";

import { DexChainId } from "@/sdk_hybrid/chains";

type TokenInfo = {
  address0: Address;
  address1: Address;
  chainId: number;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
};

export type LocalTokenList = {
  id: string;
  name: string;
  list: {
    version: {
      major: number;
      minor: number;
      patch: number;
    };
    name: string;
    tokens: TokenInfo[];
  };
  enabled: boolean;
};

export type ExternalTokenList = {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
};

export type SavedTokenList = LocalTokenList | ExternalTokenList;

type TokenLists = Record<DexChainId, SavedTokenList[]>;

interface TokenListsStore {
  tokenLists: TokenLists;
  addTokenList: (
    tokenList: Omit<LocalTokenList, "id"> | Omit<ExternalTokenList, "id">,
    chainId: DexChainId,
  ) => void;
  toggleTokenList: (tokenListId: string, chainId: DexChainId) => void;
  addTokenToCustomTokenList: (chainId: DexChainId, token: TokenInfo) => void;
  removeCustomToken: (chainId: DexChainId, tokenAddress: Address) => void;
}

const defaultTokenLists: Record<DexChainId, SavedTokenList[]> = {
  820: [
    {
      id: "coingecko_callisto",
      name: "Coingecko Callisto",
      url: "https://tokens.coingecko.com/callisto/all.json",
      enabled: true,
    },
    {
      id: "custom",
      name: "Сustom Callisto List",
      list: {
        version: {
          major: 1,
          minor: 0,
          patch: 0,
        },
        name: "Сustom Callisto List",
        tokens: [
          {
            // address0: "0x98b925eCc32cE2B8b7458ff4bd489052E58e3Cd9" as Address, // ERC-223
            // address1: "0x40769999A285730B1541DD501406168309DDa65c" as Address, // ERC-20

            address0: "0x40769999A285730B1541DD501406168309DDa65c" as Address, // ERC-20
            address1: "0x98b925eCc32cE2B8b7458ff4bd489052E58e3Cd9" as Address, // ERC-223
            name: "TestA",
            logoURI: "/tokens/placeholder.svg",
            chainId: 820,
            decimals: 18,
            symbol: "ccDTA",
          },
          {
            // address0: "0x0684F8A7cC01aD4a253Df7d55340688F8173d520" as Address, // ERC-223
            // address1: "0xb3746e05813d7dcbbB6DFb0437095e5f70Dbb393" as Address, // ERC-20

            address0: "0xb3746e05813d7dcbbB6DFb0437095e5f70Dbb393" as Address, // ERC-20
            address1: "0x0684F8A7cC01aD4a253Df7d55340688F8173d520" as Address, // ERC-223
            name: "TestB",
            logoURI: "/tokens/placeholder.svg",
            chainId: 820,
            decimals: 18,
            symbol: "ccDTB",
          },
        ],
      },
      enabled: true,
    },
  ],
  11155111: [
    {
      id: "custom",
      name: "Сustom Sepolia List",
      list: {
        version: {
          major: 1,
          minor: 0,
          patch: 0,
        },
        name: "Сustom Sepolia List",
        tokens: [
          {
            address0: "0x723FE0A6415A25ec74cF0C4cf33F600F001D1aEc" as Address,
            address1: "0x1d796072232c797CD07892FffAb79170af07E5d7" as Address,
            name: "TESTB",
            symbol: "TB",
            logoURI: "/tokens/placeholder.svg",
            chainId: 11155111,
            decimals: 18,
          },
          {
            address0: "0xFd5493FC83CE4FE44c951AA244946Bd652AC0361" as Address,
            address1: "0x3Cd18a6F06f1daF91456347E9e3972b8C532d123" as Address,
            name: "TESTC",
            symbol: "TC",
            logoURI: "/tokens/placeholder.svg",
            chainId: 11155111,
            decimals: 18,
          },
        ],
      },
      enabled: true,
    },
  ],
};

export const useTokenListsStore = create<TokenListsStore>()((set, get) => ({
  tokenLists: defaultTokenLists,
  addTokenList: (tokenList, chainId) => {
    const tokenListsForChainId = get().tokenLists[chainId];

    set({
      tokenLists: {
        ...get().tokenLists,
        [chainId]: [
          ...tokenListsForChainId,
          {
            ...tokenList,
            id: `imported_${tokenListsForChainId.length + 1}`,
          },
        ],
      },
    });
  },
  toggleTokenList: (tokenListId, chainId) => {
    const tokenListIndex = get().tokenLists[chainId].findIndex((list) => tokenListId === list.id);

    if (tokenListIndex !== -1) {
      const newTokenList = [...get().tokenLists[chainId]];
      newTokenList[tokenListIndex] = {
        ...newTokenList[tokenListIndex],
        enabled: !newTokenList[tokenListIndex].enabled,
      };

      set({
        tokenLists: {
          ...get().tokenLists,
          [chainId]: newTokenList,
        },
      });
    }
  },
  addTokenToCustomTokenList: (chainId: DexChainId, token: TokenInfo) => {
    const tokenListIndex = get().tokenLists[chainId].findIndex((list) => list.id === "custom");
    const newTokenList = [...get().tokenLists[chainId]];

    if (tokenListIndex !== -1) {
      const customList = newTokenList[tokenListIndex];
      if ("list" in customList) {
        const newCustomTokenList = [...customList.list.tokens, token];

        newTokenList[tokenListIndex] = {
          ...newTokenList[tokenListIndex],
          list: {
            ...customList.list,
            tokens: newCustomTokenList,
          },
        };

        set({
          tokenLists: {
            ...get().tokenLists,
            [chainId]: newTokenList,
          },
        });
      }
    }
  },
  removeCustomToken: (chainId: DexChainId, tokenAddress: Address) => {
    const tokenListIndex = get().tokenLists[chainId].findIndex((list) => list.id === "custom");
    const newTokenList = [...get().tokenLists[chainId]];

    if (tokenListIndex !== -1) {
      const customList = newTokenList[tokenListIndex];
      if ("list" in customList) {
        const newCustomTokenList = customList.list.tokens.filter(
          (t) => t.address0 !== tokenAddress,
        );

        newTokenList[tokenListIndex] = {
          ...newTokenList[tokenListIndex],
          list: {
            ...customList.list,
            tokens: newCustomTokenList,
          },
        };

        set({
          tokenLists: {
            ...get().tokenLists,
            [chainId]: newTokenList,
          },
        });
      }
    }
  },
}));
