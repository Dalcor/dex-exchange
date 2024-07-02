import invariant from "tiny-invariant";
import { Address } from "viem";

import { Rate } from "@/components/badges/TrustBadge";

import { checkValidAddress, validateAndParseAddress } from "../utils/validateAndParseAddress";
import { BaseCurrency } from "./baseCurrency";
import { Currency } from "./currency";

export type TokenStandard = "ERC-20" | "ERC-223";
/**
 * Represents an ERC20 token with a unique address and some metadata.
 */
export class Token extends BaseCurrency {
  public readonly isNative: false = false;
  public readonly isToken: true = true;

  /**
   * The contract address on the chain on which this token lives
   */
  public readonly address0: Address; // mostly ERC20, BEP20 tokens
  public readonly address1: Address; // mostly ERC223, BEP223 tokens

  /**
   * Token logo uri to show in UI
   */
  public readonly logoURI?: string;

  public readonly lists?: any[];
  public readonly rate?: Rate;

  /**
   * Relevant for fee-on-transfer (FOT) token taxes,
   * Not every ERC20 token is FOT token, so this field is optional
   */
  public readonly buyFeeBps?: bigint;
  public readonly sellFeeBps?: bigint;

  /**
   *
   * @param chainId {@link BaseCurrency#chainId}
   * @param address0 The contract address on the chain on which this token lives
   * @param address1 The contract address on the chain on which this token lives
   * @param decimals {@link BaseCurrency#decimals}
   * @param symbol {@link BaseCurrency#symbol}
   * @param name {@link BaseCurrency#name}
   * @param logoURI Token logotype to show in UI
   * @param lists Tokenlists token was found in
   * @param rate Token rate depending on existence in different tokenLists
   * @param bypassChecksum If true it only checks for length === 42, startsWith 0x and contains only hex characters
   * @param buyFeeBps Buy fee tax for FOT tokens, in basis points
   * @param sellFeeBps Sell fee tax for FOT tokens, in basis points
   */
  public constructor(
    chainId: number,
    address0: Address,
    address1: Address,
    decimals: number,
    symbol?: string,
    name?: string,
    logoURI?: string,
    lists?: any[],
    rate?: Rate,
    bypassChecksum?: boolean,
    buyFeeBps?: bigint,
    sellFeeBps?: bigint,
  ) {
    super(chainId, decimals, symbol, name);
    if (bypassChecksum) {
      this.address0 = checkValidAddress(address0);
      this.address1 = checkValidAddress(address1);
    } else {
      this.address0 = validateAndParseAddress(address0);
      this.address1 = validateAndParseAddress(address1);
    }
    if (buyFeeBps) {
      invariant(buyFeeBps >= BigInt(0), "NON-NEGATIVE FOT FEES");
    }
    if (sellFeeBps) {
      invariant(sellFeeBps >= BigInt(0), "NON-NEGATIVE FOT FEES");
    }
    this.buyFeeBps = buyFeeBps;
    this.sellFeeBps = sellFeeBps;
    this.logoURI = logoURI;
    this.lists = lists;
    this.rate = rate;
  }

  /**
   * Returns true if the two tokens are equivalent, i.e. have the same chainId and address.
   * @param other other token to compare
   */
  public equals(other: Currency): boolean {
    return (
      other.isToken &&
      this.chainId === other.chainId &&
      this.address0.toLowerCase() === other.address0.toLowerCase()
    );
  }

  /**
   * Returns true if the address of this token sorts before the address of the other token
   * @param other other token to compare
   * @throws if the tokens have the same address
   * @throws if the tokens are on different chains
   */
  public sortsBefore(other: Token): boolean {
    invariant(this.chainId === other.chainId, "CHAIN_IDS");
    invariant(this.address0.toLowerCase() !== other.address0.toLowerCase(), "ADDRESSES");
    return this.address0.toLowerCase() < other.address0.toLowerCase();
  }

  /**
   * Return this token, which does not need to be wrapped
   */
  public get wrapped(): Token {
    return this;
  }
}
