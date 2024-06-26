import { http } from "viem";
import { cookieStorage, createConfig, createStorage } from "wagmi";
import { coinbaseWallet, walletConnect } from "wagmi/connectors";

import { callisto } from "@/config/chains/callisto";
import { sepolia } from "@/config/chains/sepolia";

export const config = createConfig({
  chains: [callisto, sepolia],
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
    [sepolia.id]: http(),
  },
});
