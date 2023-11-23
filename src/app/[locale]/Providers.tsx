"use client";

import { PropsWithChildren } from "react";
import { defaultWagmiConfig, createWeb3Modal } from "@web3modal/wagmi/react";
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { avalanche, bsc, mainnet } from 'wagmi/chains';
import { MetaMaskConnector } from "@wagmi/connectors/metaMask";
import { WalletConnectConnector } from "@wagmi/connectors/walletConnect";
import { KeystoreConnector } from "@/config/connectors/keystore/connector";
import { LedgerConnector } from "@wagmi/connectors/ledger";
import { createWalletClient, http, publicActions } from "viem";
import { publicProvider } from "wagmi/providers/public";

// 1. Get projectId
const projectId = '05737c557c154bdb3aea937d7214eae2';

// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const web3chains = [avalanche, bsc, mainnet];
const web3config = defaultWagmiConfig({ chains: web3chains, projectId, metadata })

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, bsc], [publicProvider()]
)

const walletClient = createWalletClient({
  account: "0xF1602175601606E8ffEe38CE433A4DB4C6cf5d60",
  chain: mainnet,
  transport: http(),
}).extend(publicActions);

const wagmiConfig1 = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains, options: {
        projectId
      }
    }),
    new KeystoreConnector({
      options: {
        walletClient
      }
    }),
    new LedgerConnector({
      options: {
        projectId
      }
    })
  ],
  publicClient,
  webSocketPublicClient
})

// 3. Create modal
createWeb3Modal({
  wagmiConfig: web3config,
  projectId,
  chains,
  featuredWalletIds: [
    "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0"
  ],
  excludeWalletIds: [
    "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96"
  ]
});


export default function WagmiProvider({ children }: PropsWithChildren) {
  return <WagmiConfig config={wagmiConfig1}>
    {children}
  </WagmiConfig>
}
