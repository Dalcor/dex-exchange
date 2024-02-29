import { Address } from "viem";

export interface WrappedToken {
  address: Address,
  chainId: number,
  decimals: number,
  symbol: string,
  logoURI: string,
  lists?: string[]
}

export class WrappedToken {
  address: Address;
  name: string;
  chainId: number;
  decimals: number;
  symbol: string;
  logoURI: string;

  constructor(address: string, name: string,  symbol: string, decimals: number, logoURI: string, chainId: number,) {
    this.address = address as Address;
    this.name = name;
    this.logoURI = logoURI;
    this.chainId = chainId;
    this.decimals = decimals;
    this.symbol = symbol;
  }
}
