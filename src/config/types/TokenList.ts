import { Token } from "@/sdk_hybrid/entities/token";

export class TokenList {
  id: string;
  name: string;
  logoURI: string;
  chainId: number;
  tokens: Token[];
  enabled: boolean;

  constructor(
    id: string,
    name: string,
    logoURI: string,
    chainId: number,
    tokens: Token[],
    enabled: boolean,
  ) {
    this.id = id;
    this.name = name;
    this.logoURI = logoURI;
    this.chainId = chainId;
    this.tokens = tokens;
    this.enabled = enabled;
  }
}
