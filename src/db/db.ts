import Dexie, { Table } from "dexie";

import { Token } from "@/sdk_hybrid/entities/token";

export interface TokenList {
  id?: number | "custom" | "default";
  enabled: boolean;
  list: {
    logoURI: string;
    version: {
      patch: number;
      minor: number;
      major: number;
    };
    name: string;
    tokens: Token[];
  };
}
export class TokenListsDexie extends Dexie {
  // 'tokenLists' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  tokenLists!: Table<TokenList>;

  constructor() {
    super("dex223TokenListsDatabase");
    this.version(1).stores({
      tokenLists: "++id, enabled, list", // Primary key and indexed props
    });
  }
}

export const db = new TokenListsDexie();
