import { Token } from "@/sdk_hybrid/entities/token";

export const sepoliaDefaultList = {
  version: {
    major: 1,
    minor: 0,
    patch: 4,
  },
  logoURI: "/token-list-placeholder.svg",
  name: "DEX223 Sepolia Default",
  tokens: [
    new Token(
      11155111,
      "0x7F4C5c87C630b3f8a2265FD76413E7d6C7DEbFB4",
      "0x66Ea23B4aFD15B2996C9F18Bc3E09F568b36C495",
      18,
      "TSP1",
      "Test Sep 1",
      "/tokens/placeholder.svg",
    ),
    new Token(
      11155111,
      "0x73a68acd477ABf858fd3b18a9A13d080B781cbE5",
      "0xC6aE7620aB304e6A43b0f50b669c5127Ee202e84",
      6,
      "TSP2",
      "Test Sep 2",
      "/tokens/placeholder.svg",
    ),
    new Token(
      11155111,
      "0x78B2BebFb31788372F449a8fD7b9BA7B654B03E4",
      "0x9B782dc4300E206C8E1B8825B868e04034Ba7749",
      0,
      "TSP3",
      "Test Sep 3",
      "/tokens/placeholder.svg",
    ),
  ],
};
