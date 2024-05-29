import { Token } from "@/sdk_hybrid/entities/token";

export const sepoliaDefaultList = {
  version: {
    major: 1,
    minor: 0,
    patch: 3,
  },
  logoURI: "/token-list-placeholder.svg",
  name: "DEX223 Sepolia Default",
  tokens: [
    new Token(
      11155111,
      "0x7F4C5c87C630b3f8a2265FD76413E7d6C7DEbFB4",
      "0xEa33Be831E10275A4E95e7B55d919b0EF94f87a1",
      18,
      "TSP1",
      "Test Sep 1",
      "/tokens/placeholder.svg",
    ),
    new Token(
      11155111,
      "0x73a68acd477ABf858fd3b18a9A13d080B781cbE5",
      "0x9165505a0a43FF674c889725e8075b6C96BA4d12",
      6,
      "TSP2",
      "Test Sep 2",
      "/tokens/placeholder.svg",
    ),
    new Token(
      11155111,
      "0x78B2BebFb31788372F449a8fD7b9BA7B654B03E4",
      "0x982b8ab7381ca45f60F6933A2338cE176bf69f17",
      0,
      "TSP3",
      "Test Sep 3",
      "/tokens/placeholder.svg",
    ),
  ],
};
