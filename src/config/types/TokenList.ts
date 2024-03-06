import { WrappedToken } from "@/config/types/WrappedToken";

export class TokenList {
  id: string;
  name: string;
  logoURI: string;
  chainId: number;
  tokens: WrappedToken[];
  enabled: boolean;

  constructor(
    id: string,
    name: string,
    logoURI: string,
    chainId: number,
    tokens: WrappedToken[],
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
