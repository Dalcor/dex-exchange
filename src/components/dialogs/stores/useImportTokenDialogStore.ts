import { Address } from "viem";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const localStorageKey = "user-tokens";

interface TokenInfo {
  name: string;
  decimals: string;
  address: Address;
}

interface UserTokensStore {
  userTokens: TokenInfo[];
  addToken: (token: TokenInfo) => void;
  removeToken: (address: Address) => void;
}

export const useUserTokensStore = create<UserTokensStore>()(
  persist(
    (set, get) => ({
      userTokens: [],
      addToken: (token) =>
        set((state) => {
          return { userTokens: [...get().userTokens, token] };
        }),
      removeToken: (address) =>
        set(() => {
          return { userTokens: get().userTokens.filter((t) => t.address !== address) };
        }),
    }),
    {
      name: localStorageKey, // name of the item in the storage (must be unique)
    },
  ),
);
