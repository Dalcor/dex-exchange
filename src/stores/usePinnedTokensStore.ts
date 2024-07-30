import { Address } from "viem";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEX_SUPPORTED_CHAINS, DexChainId } from "@/sdk_hybrid/chains";

interface PinnedTokensStore {
  tokens: Record<DexChainId, Array<Address>>;
  pinToken: (address: Address, chainId: DexChainId) => void;
  unpinToken: (address: Address, chainId: DexChainId) => void;
  toggleToken: (address: Address, chainId: DexChainId) => void;
  getPinnedTokens: (chainId: DexChainId) => Array<Address>;
}

const f = DEX_SUPPORTED_CHAINS.map((chainId) => [chainId, []]);

export const usePinnedTokensStore = create<PinnedTokensStore>()(
  persist(
    (set, get) => ({
      tokens: Object.fromEntries(f),
      pinToken: (address, chainId) => {
        const currentPinned = get().tokens[chainId];
        set({
          tokens: {
            ...get().tokens,
            [chainId]: [address, ...currentPinned],
          },
        });
      },
      toggleToken: (address, chainId) => {
        const currentPinned = get().tokens[chainId];
        if (!currentPinned) {
          set({
            tokens: {
              ...get().tokens,
              [chainId]: [address],
            },
          });
        }

        if (currentPinned.includes(address)) {
          set({
            tokens: {
              ...get().tokens,
              [chainId]: currentPinned.filter((a) => a !== address),
            },
          });
        } else {
          set({
            tokens: {
              ...get().tokens,
              [chainId]: [...currentPinned, address],
            },
          });
        }
      },
      unpinToken: (address, chainId) => {
        const currentPinned = get().tokens[chainId];
        set({
          tokens: {
            ...get().tokens,
            [chainId]: currentPinned.filter((a) => a !== address),
          },
        });
      },
      getPinnedTokens: (chainId) => get().tokens[chainId],
    }),
    {
      name: "d223-pinned-tokens", // name of the item in the storage (must be unique)
    },
  ),
);

type PoolAddress = {
  isLoading: boolean;
  address?: Address;
};
export type PoolAddresses = {
  [key: string]: PoolAddress;
};
interface PoolAddressesStore {
  addresses: PoolAddresses;
  addPoolAddress: (key: string, address: PoolAddress) => void;
}

export const usePoolAddresses = create<PoolAddressesStore>((set, get) => ({
  addresses: {},
  addPoolAddress: (key, address) => set({ addresses: { ...get().addresses, [key]: address } }),
}));
