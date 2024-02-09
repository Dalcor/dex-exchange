export const wallets: {
  [key: string]: {
    name: string,
    image: string
  }
} = {
  metamask: {
    name: "Metamask",
    image: "/wallets/metamask.svg"
  },
  wc: {
    name: "WalletConnect",
    image: "/wallets/wc.svg"
  },
  keystore: {
    name: "Keystore",
    image: "/wallets/keystore.svg"
  },
  ledger: {
    name: "Ledger",
    image: "/wallets/ledger.svg"
  },
  trustWallet: {
    name: "Trust Wallet",
    image: "/wallets/trust.svg"
  },
  unknown: {
    name: "Unknown",
    image: "/wallets/default.svg"
  }
}
