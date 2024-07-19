import { Address, Hash } from "viem";

export const renderShortAddress = (address: Address, symbols = 4) =>
  address && `${address.substring(0, symbols + 2)}...${address.substring(42 - symbols, 42)}`;

export const renderShortHash = (hash: Hash, symbols = 4) =>
  hash && `${hash.substring(0, symbols + 2)}...${hash.substring(66 - symbols, 66)}`;
