import { create } from "zustand";

export type WalletName = "metamask" | "wc" | "coinbase" | "trustWallet" | "keystore";
export type AvailableChains = 820 | 61 | 1 | 56 | 137 | 10 | 42161 | 42220 | 43114 | 8453;
interface ConnectWalletStore {
  walletName: WalletName,
  setName: (walletName: WalletName) => void,
  chainToConnect: AvailableChains,
  setChainToConnect: (chain: AvailableChains) => void,

  wcChainsToConnect: number[], //for simultaneous connection via walletConnect
  addChainToConnect: (chain: number) => void,
  removeChainToConnect: (chain: number) => void,
}

export const useConnectWalletStore = create<ConnectWalletStore>((set, get) => ({
  walletName: "metamask",
  setName: (walletName) => set({walletName}),

  chainToConnect: 820,
  setChainToConnect: (chainToConnect) => set({chainToConnect}),

  wcChainsToConnect: [820, 199, 61],
  addChainToConnect: (chain) => {
    const newChainsSet = [...get().wcChainsToConnect, chain];
    return set({wcChainsToConnect: newChainsSet})
  },
  removeChainToConnect: (chain) => {
    const newChainsSet = [...get().wcChainsToConnect].filter((e) => e !== chain);
    return set({wcChainsToConnect: newChainsSet})
  }
}));


interface ConnectWalletDialogStateStore {
  isOpened: boolean,
  setIsOpened: (isOpened: boolean) => void
}
export const useConnectWalletDialogStateStore = create<ConnectWalletDialogStateStore>((set, get) => ({
  isOpened: false,
  setIsOpened: (isOpened) => set({isOpened})
}));
