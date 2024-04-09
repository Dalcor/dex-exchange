import { http } from "viem";
import { cookieStorage, createConfig, createStorage } from "wagmi";
import { arbitrum, avalanche, base, bsc, celo, classic, optimism, polygon } from "wagmi/chains";
import { coinbaseWallet, walletConnect } from "wagmi/connectors";

import { callisto } from "@/config/chains/callisto";
import { mainnet } from "@/config/chains/mainnet";
import { sepolia } from "@/config/chains/sepolia";

export const config = createConfig({
  chains: [
    callisto,
    classic,
    mainnet,
    celo,
    arbitrum,
    avalanche,
    bsc,
    polygon,
    optimism,
    base,
    sepolia,
  ],
  connectors: [
    walletConnect({
      projectId: "0af4613ea1c747c660416c4a7a114616",
    }),
    coinbaseWallet({
      appName: "DEX223",
    }),
  ],
  multiInjectedProviderDiscovery: true,
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
    [base.id]: http(),
    [sepolia.id]: http(),
  },
});
