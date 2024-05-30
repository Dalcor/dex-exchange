import { create } from "zustand";

import { DEX_SUPPORTED_CHAINS, DexChainId } from "@/sdk_hybrid/chains";

export type WalletName = "metamask" | "wc" | "coinbase" | "trustWallet" | "keystore" | "safe";

interface ConnectWalletStore {
  walletName: WalletName;
  setName: (walletName: WalletName) => void;
  chainToConnect: DexChainId;
  setChainToConnect: (chain: DexChainId) => void;

  wcChainsToConnect: number[]; //for simultaneous connection via walletConnect
  addChainToConnect: (chain: number) => void;
  removeChainToConnect: (chain: number) => void;
}

export const useConnectWalletStore = create<ConnectWalletStore>((set, get) => ({
  walletName: "metamask",
  setName: (walletName) => set({ walletName }),

  chainToConnect: DexChainId.SEPOLIA,
  setChainToConnect: (chainToConnect) => set({ chainToConnect }),

  wcChainsToConnect: DEX_SUPPORTED_CHAINS,
  addChainToConnect: (chain) => {
    const newChainsSet = [...get().wcChainsToConnect, chain];
    return set({ wcChainsToConnect: newChainsSet });
  },
  removeChainToConnect: (chain) => {
    const newChainsSet = [...get().wcChainsToConnect].filter((e) => e !== chain);
    return set({ wcChainsToConnect: newChainsSet });
  },
}));

interface ConnectWalletDialogStateStore {
  isOpened: boolean;
  setIsOpened: (isOpened: boolean) => void;
}
export const useConnectWalletDialogStateStore = create<ConnectWalletDialogStateStore>(
  (set, get) => ({
    isOpened: false,
    setIsOpened: (isOpened) => set({ isOpened }),
  }),
);
