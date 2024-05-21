import { Token } from "@/sdk_hybrid/entities/token";

export const sepoliaDefaultList = {
  version: {
    major: 1,
    minor: 0,
    patch: 2,
  },
  logoURI: "/token-list-placeholder.svg",
  name: "Sepolia Default List",
  tokens: [
    new Token(
      11155111,
      "0x7F4C5c87C630b3f8a2265FD76413E7d6C7DEbFB4",
      "0x47329E626e2FCCed96e14909a154b3F61AfE3477",
      18,
      "TSP1",
      "Test Sep 1",
      "/tokens/placeholder.svg",
    ),
    new Token(
      11155111,
      "0x73a68acd477ABf858fd3b18a9A13d080B781cbE5",
      "0x4D2D54436afa2B1ee5B7BaaBbBA72E7D6a54BE17",
      6,
      "TSP2",
      "Test Sep 2",
      "/tokens/placeholder.svg",
    ),
  ],
};
