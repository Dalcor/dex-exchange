import { Token } from "@/sdk_hybrid/entities/token";

export const sepoliaDefaultList = {
  version: {
    major: 1,
    minor: 0,
    patch: 5,
  },
  logoURI: "/token-list-placeholder.svg",
  name: "DEX223 Sepolia Default",
  tokens: [
    new Token(
      11155111,
      "0x51a3F4b5fFA9125Da78b55ed201eFD92401604fa",
      "0xD3783257FD5E5b0CFA244eC14dc10B2263dC5f63",
      18,
      "TOT1",
      "Total Test 1",
      "/tokens/placeholder.svg",
    ),
    new Token(
      11155111,
      "0x30C7A2261Ad72ad12393B075163Bf9a72a2dA4f8",
      "0x1A57D43b2F1Aed52106614eE4D3359247bD1982a",
      6,
      "TOT2",
      "Total Test 2",
      "/tokens/placeholder.svg",
    ),
    new Token(
      11155111,
      "0x18B32000CEaAe9BE1cec1cb6845EF7bba1c9DC02",
      "0x77eBa0266AcCf29e80A753645FC964975ad25C75",
      0,
      "TOT3",
      "Total Test 3",
      "/tokens/placeholder.svg",
    ),
    new Token(
      11155111,
      "0xa083e42B1525c67A90Cb1628acBC99895dC0447B",
      "0x2992B2Efcef1f63297a4C34404AF9b8B39E3f2Ef",
      0,
      "TOT4Z",
      "Total Test 4Z",
      "/tokens/placeholder.svg",
    ),
  ],
};
