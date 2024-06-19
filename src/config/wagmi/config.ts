import { fallback, http, webSocket } from "viem";
import { bscTestnet } from "viem/chains";
import { createConfig, createStorage, parseCookie } from "wagmi";
import { coinbaseWallet, metaMask, walletConnect } from "wagmi/connectors";

import { sepolia } from "@/config/chains/sepolia";

const cookieStorage = {
  getItem(key: string) {
    if (typeof window === "undefined") return null;
    const value = parseCookie(document.cookie, key);
    return value ?? null;
  },
  setItem(key: string, value: string) {
    if (typeof window === "undefined") return;
    document.cookie = `${key}=${value};Path=/;SameSite=Lax`;
  },
  removeItem(key: string) {
    if (typeof window === "undefined") return;
    document.cookie = `${key}=;Path=/;max-age=-1`;
  },
};

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
      dappMetadata: {
        name: "dex223.io",
      },
    }),
  ],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [sepolia.id]: fallback([
      webSocket("wss://sepolia.infura.io/ws/v3/6689c099b8d542589b1842e30dbc2027"),
      webSocket("wss://eth-sepolia.g.alchemy.com/v2/kvidqVpyVu4aivBEb55XXIzCHDqMm7CO"),
      http("https://sepolia.infura.io/v3/6689c099b8d542589b1842e30dbc2027"),
      http("https://eth-sepolia.g.alchemy.com/v2/kvidqVpyVu4aivBEb55XXIzCHDqMm7CO"),
      http("https://rpc.ankr.com/eth_sepolia"),
      http(),
    ]),
    [bscTestnet.id]: http(),
  },
});
