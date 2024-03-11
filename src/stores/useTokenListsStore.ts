import { Address } from "viem";
import { create } from "zustand";

import { AvailableChains } from "@/components/dialogs/stores/useConnectWalletStore";

type TokenInfo = {
  address: Address;
  chainId: number;
  name: string;
  symbol: string;
  decimals: number;
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

type TokenLists = Record<AvailableChains, SavedTokenList[]>;

interface TokenListsStore {
  tokenLists: TokenLists;
  addTokenList: (
    tokenList: Omit<LocalTokenList, "id"> | Omit<ExternalTokenList, "id">,
    chainId: AvailableChains,
  ) => void;
  toggleTokenList: (tokenListId: string, chainId: AvailableChains) => void;
  addTokenToCustomTokenList: (chainId: AvailableChains, token: TokenInfo) => void;
  removeCustomToken: (chainId: AvailableChains, tokenAddress: Address) => void;
}

const defaultTokenLists = {
  1: [
    {
      id: "coingecko_ethereum",
      name: "Coingecko Ethereum",
      url: "https://tokens.coingecko.com/ethereum/all.json",
      enabled: true,
    },
    {
      id: "optimism-main",
      name: "Main Optimism",
      url: "https://static.optimism.io/optimism.tokenlist.json",
      enabled: true,
    },
    {
      id: "uniswap-main",
      name: "Uniswap Labs Default",
      url: "https://tokens.uniswap.org/",
      enabled: true,
    },
    {
      id: "1inch",
      name: "1NCH",
      url: "https://wispy-bird-88a7.uniswap.workers.dev/?url=https://tokens.1inch.eth.link",
      enabled: true,
    },
    {
      id: "custom",
      name: "Сustom Ethereum List",
      list: {
        version: {
          major: 1,
          minor: 0,
          patch: 0,
        },
        name: "Сustom Ethereum List",
        tokens: [],
      },
      enabled: true,
    },
  ],
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
        tokens: [],
      },
      enabled: true,
    },
  ],
  42161: [
    {
      id: "coingecko_arbitrum_one",
      name: "Coingecko Arbitrum",
      url: "https://tokens.coingecko.com/arbitrum-one/all.json",
      enabled: true,
    },
    {
      id: "custom",
      name: "Сustom Arbitrum List",
      list: {
        version: {
          major: 1,
          minor: 0,
          patch: 0,
        },
        name: "Сustom Arbitrum List",
        tokens: [],
      },
      enabled: true,
    },
  ],
  56: [
    {
      id: "coingecko_bsc",
      name: "Coingecko BSC",
      url: "https://tokens.coingecko.com/binance-smart-chain/all.json",
      enabled: true,
    },
    {
      id: "custom",
      name: "Сustom BSC List",
      list: {
        version: {
          major: 1,
          minor: 0,
          patch: 0,
        },
        name: "Сustom BSC List",
        tokens: [],
      },
      enabled: true,
    },
  ],
  61: [
    {
      id: "coingecko_ethereum_classic",
      name: "Coingecko ETC",
      url: "https://tokens.coingecko.com/ethereum-classic/all.json",
      enabled: true,
    },
    {
      id: "custom",
      name: "Сustom ETC List",
      list: {
        version: {
          major: 1,
          minor: 0,
          patch: 0,
        },
        name: "Сustom ETC List",
        tokens: [],
      },
      enabled: true,
    },
  ],
  10: [
    {
      id: "coingecko_optimistic-ethereum",
      name: "Coingecko Optimism",
      url: "https://tokens.coingecko.com/optimistic-ethereum/all.json",
      enabled: true,
    },
    {
      id: "optimism-main",
      name: "Main Optimism",
      url: "https://static.optimism.io/optimism.tokenlist.json",
      enabled: true,
    },
    {
      id: "custom",
      name: "Сustom Optimism List",
      list: {
        version: {
          major: 1,
          minor: 0,
          patch: 0,
        },
        name: "Сustom Optimism List",
        tokens: [],
      },
      enabled: true,
    },
  ],
  137: [
    {
      id: "coingecko_polygon-pos",
      name: "Coingecko Polygon",
      url: "https://tokens.coingecko.com/polygon-pos/all.json",
      enabled: true,
    },
    {
      id: "custom",
      name: "Сustom Polygon List",
      list: {
        version: {
          major: 1,
          minor: 0,
          patch: 0,
        },
        name: "Сustom Polygon List",
        tokens: [],
      },
      enabled: true,
    },
  ],
  42220: [
    {
      id: "coingecko_celo",
      name: "Coingecko Celo",
      url: "https://tokens.coingecko.com/celo/all.json",
      enabled: true,
    },
    {
      id: "celo_main",
      name: "Celo Token List",
      url: "https://celo-org.github.io/celo-token-list/celo.tokenlist.json",
      enabled: true,
    },
    {
      id: "custom",
      name: "Сustom Celo List",
      list: {
        version: {
          major: 1,
          minor: 0,
          patch: 0,
        },
        name: "Сustom Celo List",
        tokens: [],
      },
      enabled: true,
    },
  ],
  43114: [
    {
      id: "coingecko_avalanche",
      name: "Coingecko Avalanche",
      url: "https://tokens.coingecko.com/avalanche/all.json",
      enabled: true,
    },
    {
      id: "custom",
      name: "Сustom Avalanche List",
      list: {
        version: {
          major: 1,
          minor: 0,
          patch: 0,
        },
        name: "Сustom Avalanche List",
        tokens: [],
      },
      enabled: true,
    },
  ],
  8453: [
    {
      id: "coingecko_base",
      name: "Coingecko Base",
      url: "https://tokens.coingecko.com/base/all.json",
      enabled: true,
    },
    {
      id: "custom",
      name: "Сustom Base List",
      list: {
        version: {
          major: 1,
          minor: 0,
          patch: 0,
        },
        name: "Сustom Base List",
        tokens: [],
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
            address: "0xBC88C16D3adAacCC1f52503C4C972bA9C151F853" as Address,
            name: "Token A",
            logoURI: "/tokens/placeholder.svg",
            chainId: 11155111,
            decimals: 6,
            symbol: "DTA",
          },
          {
            address: "0xb32F7065949Ea3826d6E5936B07E5F1567707588" as Address,
            name: "Token B",
            logoURI: "/tokens/placeholder.svg",
            chainId: 11155111,
            decimals: 6,
            symbol: "DTB",
          },
          {
            address: "0xA6de6C90f2FFd30B54b830359a9f17Ed44dd63Ac" as Address,
            name: "USDT",
            logoURI: "/tokens/placeholder.svg",
            chainId: 11155111,
            decimals: 6,
            symbol: "USDT",
          },
          {
            address: "0x7fc21ceb0c5003576ab5e101eb240c2b822c95d2" as Address,
            name: "USDC",
            logoURI: "/tokens/placeholder.svg",
            chainId: 11155111,
            decimals: 6,
            symbol: "USDC",
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
  addTokenToCustomTokenList: (chainId: AvailableChains, token: TokenInfo) => {
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
  removeCustomToken: (chainId: AvailableChains, tokenAddress: Address) => {
    const tokenListIndex = get().tokenLists[chainId].findIndex((list) => list.id === "custom");
    const newTokenList = [...get().tokenLists[chainId]];

    if (tokenListIndex !== -1) {
      const customList = newTokenList[tokenListIndex];
      if ("list" in customList) {
        const newCustomTokenList = customList.list.tokens.filter((t) => t.address !== tokenAddress);

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
