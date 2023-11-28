"use client";

import { PropsWithChildren } from "react";
import { configureChains, Connector, createConfig, WagmiConfig } from 'wagmi';
import { avalanche, bsc, mainnet } from 'wagmi/chains';
import { MetaMaskConnector } from "@wagmi/connectors/metaMask";
import { WalletConnectConnector } from "@wagmi/connectors/walletConnect";
import { LedgerConnector } from "@wagmi/connectors/ledger";
import { publicProvider } from "wagmi/providers/public";
import { callisto } from "@/config/chains/clo";

// 1. Get projectId
const projectId = '05737c557c154bdb3aea937d7214eae2';
const web3chains = [callisto, avalanche, bsc, mainnet];

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  web3chains, [publicProvider()]
)

const connectors: Connector[] = [
  new MetaMaskConnector({
    chains,
    options: {
      UNSTABLE_shimOnConnectSelectAccount: true,
    },
  }),
  new WalletConnectConnector({
    chains, options: {
      projectId,
      qrModalOptions: {
        themeMode: "dark"
      }
    },
  }),
  new LedgerConnector({
    chains,
    options: {
      projectId
    }
  })
]


const wagmiConfig1 = createConfig({
  autoConnect: true,
  connectors: connectors,
  publicClient,
  webSocketPublicClient
});
export default function WagmiProvider({ children }: PropsWithChildren) {
  return <WagmiConfig config={wagmiConfig1}>
    {children}
  </WagmiConfig>
}
