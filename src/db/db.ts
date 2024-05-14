import Dexie, { Table } from "dexie";
import { Address } from "viem";

import { DexChainId } from "@/sdk_hybrid/chains";

export interface TokenList {
  id?: number;
  list: {
    version: {
      patch: number;
      minor: number;
      major: number;
    };
    name: string;
    tokens: {
      address0: Address;
      address1: Address;
      name: string;
      logoURI: string;
      chainId: DexChainId;
      decimals: number;
      symbol: string;
    }[];
  };
}

export class TokenListsDexie extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  tokenLists!: Table<TokenList>;

  constructor() {
    super("dex223TokenListsDatabase");
    this.version(1).stores({
      tokenLists: "++id, list", // Primary key and indexed props
    });
  }
}

export const db = new TokenListsDexie();
