import { Token } from "@/sdk/entities/token";

export class WrappedToken extends Token{
  logoURI: string;

  constructor(address: string, name: string,  symbol: string, decimals: number, logoURI: string, chainId: number,) {
    super(chainId, address, decimals, symbol, name);
    this.logoURI = logoURI;
  }
}
