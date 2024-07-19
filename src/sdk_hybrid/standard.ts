import { Token } from "@/sdk_hybrid/entities/token";

export enum Standard {
  ERC20 = "ERC-20",
  ERC223 = "ERC-223",
}

export function getTokenAddressForStandard(token: Token, standard: Standard) {
  return standard === Standard.ERC20 ? token.address0 : token.address1;
}
