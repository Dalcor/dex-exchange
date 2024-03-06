import { Address } from "viem";
import { Token } from "@/sdk/entities/token";


export class WrappedToken extends Token{
  public readonly logoURI: string;
  public readonly lists?: string[];

  constructor(address: string, name: string,  symbol: string, decimals: number, logoURI: string, chainId: number, lists?: string[]) {
    super(chainId, address, decimals, symbol, name);
    this.logoURI = logoURI;
    this.lists = lists;
  }
}
