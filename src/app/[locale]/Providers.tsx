"use client";

import { PropsWithChildren } from "react";
import { defaultWagmiConfig, createWeb3Modal } from "@web3modal/wagmi/react";
import { WagmiConfig } from 'wagmi';
import { avalanche, bsc, mainnet } from 'wagmi/chains';


// 1. Get projectId
const projectId = '05737c557c154bdb3aea937d7214eae2';

// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [avalanche, bsc, mainnet];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// 3. Create modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  featuredWalletIds: [
    "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0"
  ],
  excludeWalletIds: [
    "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96"
  ]
});


export default function WagmiProvider({children}: PropsWithChildren) {
  return <WagmiConfig config={wagmiConfig}>
    {children}
  </WagmiConfig>
}
