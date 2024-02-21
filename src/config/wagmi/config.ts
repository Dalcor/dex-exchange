import { cookieStorage, createConfig, createStorage } from "wagmi";
import { callisto } from "@/config/chains/callisto";
import { arbitrum, avalanche, base, bsc, celo, classic, optimism, polygon } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";
import { http } from "viem";
import { mainnet } from "viem/chains";

export const config = createConfig({
  chains: [callisto, classic, mainnet, celo, arbitrum, avalanche, bsc, polygon, optimism, base],
  connectors: [
    injected({target: "metaMask"}),
    walletConnect({
      projectId: "0af4613ea1c747c660416c4a7a114616"
    }),
    injected({target: "trust"}),
    coinbaseWallet({
      appName: "DEX223"
    })
  ],

  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [callisto.id]: http(),
    [classic.id]: http(),
    [mainnet.id]: http(),
    [celo.id]: http(),
    [arbitrum.id]: http(),
    [avalanche.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [base.id]: http()
  },
})
