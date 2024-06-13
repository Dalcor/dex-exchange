import { fallback, http, webSocket } from "viem";
import { bscTestnet } from "viem/chains";
import { cookieStorage, createConfig, createStorage } from "wagmi";
import { coinbaseWallet, metaMask, walletConnect } from "wagmi/connectors";

// import { callisto } from "@/config/chains/callisto";
import { sepolia } from "@/config/chains/sepolia";

export const config = createConfig({
  chains: [
    // callisto,
    sepolia,
    bscTestnet,
  ],
  connectors: [
    walletConnect({
      projectId: "0af4613ea1c747c660416c4a7a114616",
    }),
    coinbaseWallet({
      appName: "DEX223",
    }),
    metaMask({
      extensionOnly: false,
      dappMetadata: {
        name: "app.dex223.io",
      },
    }),
  ],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    // [callisto.id]: http(),
    [sepolia.id]: fallback([
      webSocket("wss://sepolia.infura.io/ws/v3/114e971e806248a0b32aa14b5477286b"),
      http("https://sepolia.infura.io/v3/114e971e806248a0b32aa14b5477286b"),
      http(),
    ]),
    [bscTestnet.id]: http(),
  },
});
