import { create } from "zustand";
import { AvailableChains } from "@/components/dialogs/stores/useConnectWalletStore";
import { Address } from "viem";

type TokenInfo = {
  address: string,
  chainId: number,
  name: string,
  symbol: string,
  decimals: number
}

export type LocalTokenList = {
  id: string,
  name: string,
  list: {
    version: {
      major: number,
      minor: number,
      patch: number
    },
    name: string,
    tokens: TokenInfo[]
  },
  enabled: boolean
}

export type ExternalTokenList = {
  id: string,
  name: string,
  url: string,
  enabled: boolean
}

export type SavedTokenList = LocalTokenList | ExternalTokenList;

interface TokenLists {
  tokenLists: {
    1: SavedTokenList[],
    820: SavedTokenList[]
    42161: SavedTokenList[],
    56: SavedTokenList[],
    61: SavedTokenList[],
    10: SavedTokenList[],
    137: SavedTokenList[],
    42220: SavedTokenList[],
    43114: SavedTokenList[],
    8453: SavedTokenList[]
  },
  addTokenList: (tokenList: SavedTokenList, chainId: AvailableChains) => void,
  toggleTokenList: (tokenListId: string, chainId: AvailableChains) => void,
  addTokenToCustomTokenList: (chainId: AvailableChains, token: TokenInfo) => void,
  removeCustomToken: (chainId: AvailableChains, tokenAddress: Address) => void
}

const defaultTokenLists = {
  1: [
    {
      id: "coingecko_ethereum",
      name: "Coingecko Ethereum",
      url: "https://tokens.coingecko.com/ethereum/all.json",
      enabled: true
    },
    {
      id: "optimism-main",
      name: "Main Optimism",
      url: "https://static.optimism.io/optimism.tokenlist.json",
      enabled: true
    },
    {
      id: "uniswap-main",
      name: "Uniswap Labs Default",
      url: "https://tokens.uniswap.org/",
      enabled: true
    },
    {
      id: "1inch",
      name: "1NCH",
      url: "https://wispy-bird-88a7.uniswap.workers.dev/?url=https://tokens.1inch.eth.link",
      enabled: true
    },
    {
      id: "custom_ethereum",
      name: "Сustom Ethereum List",
      list: {
        version: {
          major: 1,
          minor: 0,
          patch: 0
        },
        name: "Сustom Ethereum List",
        tokens: [
          {
            address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            chainId: 1,
            name: "USD Coin",
            symbol: "USDC",
            decimals: 18
          }
        ]
      },
      enabled: true
    }
  ],
  820: [
    {
      id: "coingecko_callisto",
      name: "Coingecko Callisto",
      url: "https://tokens.coingecko.com/callisto/all.json",
      enabled: true
    }
  ],
  42161: [
    {
      id: "coingecko_arbitrum_one",
      name: "Coingecko Arbitrum",
      url: "https://tokens.coingecko.com/arbitrum-one/all.json",
      enabled: true
    }
  ],
  56: [
    {
      id: "coingecko_bsc",
      name: "Coingecko BSC",
      url: "https://tokens.coingecko.com/binance-smart-chain/all.json",
      enabled: true
    }
  ],
  61: [
    {
      id: "coingecko_ethereum_classic",
      name: "Coingecko ETC",
      url: "https://tokens.coingecko.com/ethereum-classic/all.json",
      enabled: true
    }
  ],
  10: [
    {
      id: "coingecko_optimistic-ethereum",
      name: "Coingecko Optimism",
      url: "https://tokens.coingecko.com/optimistic-ethereum/all.json",
      enabled: true
    },
    {
      id: "optimism-main",
      name: "Main Optimism",
      url: "https://static.optimism.io/optimism.tokenlist.json",
      enabled: true
    }
  ],
  137: [
    {
      id: "coingecko_polygon-pos",
      name: "Coingecko Polygon",
      url: "https://tokens.coingecko.com/polygon-pos/all.json",
      enabled: true
    }
  ],
  42220: [
    {
      id: "coingecko_celo",
      name: "Coingecko Celo",
      url: "https://tokens.coingecko.com/celo/all.json",
      enabled: true
    },
    {
      id: "celo_main",
      name: "Celo Token List",
      url: "https://celo-org.github.io/celo-token-list/celo.tokenlist.json",
      enabled: true
    }
  ],
  43114: [
    {
      id: "coingecko_avalanche",
      name: "Coingecko Avalanche",
      url: "https://tokens.coingecko.com/avalanche/all.json",
      enabled: true
    }
  ],
  8453: [
    {
      id: "coingecko_base",
      name: "Coingecko Base",
      url: "https://tokens.coingecko.com/base/all.json",
      enabled: true
    }
  ]
};

export const useTokenListsStore = create<TokenLists>()((set, get) => ({
  tokenLists: defaultTokenLists,
  addTokenList: ((tokenList, chainId) => set({
    tokenLists: {
      ...get().tokenLists,
      [chainId]: [...get().tokenLists[chainId], tokenList]
    }
  })),
  toggleTokenList: ((tokenListId, chainId) => {
    const tokenListIndex = get().tokenLists[chainId].findIndex(list => tokenListId === list.id);


    if (tokenListIndex !== -1) {
      const newTokenList = [...get().tokenLists[chainId]];
      newTokenList[tokenListIndex] = { ...newTokenList[tokenListIndex], enabled: !newTokenList[tokenListIndex].enabled }

      set({
        tokenLists: {
          ...get().tokenLists,
          [chainId]: newTokenList
        }
      })
    }
  }),
  addTokenToCustomTokenList: (chainId: AvailableChains, token: TokenInfo) => {
    const tokenListIndex = get().tokenLists[chainId].findIndex(list => list.id === "custom_ethereum");
    const newTokenList = [...get().tokenLists[chainId]];

    if (tokenListIndex !== -1) {
      const customList = newTokenList[tokenListIndex];
      if("list" in customList) {
        const newCustomTokenList = [...customList.list.tokens, token];

        newTokenList[tokenListIndex] = { ...newTokenList[tokenListIndex], list: {
          ...customList.list,
          tokens: newCustomTokenList
        }};

        set({
          tokenLists: {
            ...get().tokenLists,
            [chainId]: newTokenList
          }
        })
      }
    }
  },
  removeCustomToken: (chainId: AvailableChains, tokenAddress: Address) => {
    const tokenListIndex = get().tokenLists[chainId].findIndex(list => list.id === "custom_ethereum");
    const newTokenList = [...get().tokenLists[chainId]];

    if (tokenListIndex !== -1) {
      const customList = newTokenList[tokenListIndex];
      if("list" in customList) {
        const newCustomTokenList = customList.list.tokens.filter(t => t.address !== tokenAddress);

        newTokenList[tokenListIndex] = { ...newTokenList[tokenListIndex], list: {
          ...customList.list,
          tokens: newCustomTokenList
        }};

        set({
          tokenLists: {
            ...get().tokenLists,
            [chainId]: newTokenList
          }
        })
      }
    }
  }
}));
