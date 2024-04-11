import { Address } from "viem";

import { DexChainId } from "./chains";

export const FACTORY_ADDRESS: Record<DexChainId, Address> = {
  [DexChainId.CALLISTO]: "0xEAc1aF2e4472219b88e56dC009F4824547830AC0",
  [DexChainId.SEPOLIA]: "0x41368e68E2EB0A74CBa9d4f6B418B487b7df5e58",
};
export const ROUTER_ADDRESS: Record<DexChainId, Address> = {
  [DexChainId.CALLISTO]: "0xd71B50caF51f39657BA358759c54777FA44357Fb",
  [DexChainId.SEPOLIA]: "0xd71B50caF51f39657BA358759c54777FA44357Fb",
};

export const QUOTER_ADDRESS: Record<DexChainId, Address> = {
  [DexChainId.CALLISTO]: "0xf35D69f403E89d54e4D3d6B01125010AB596095e",
  [DexChainId.SEPOLIA]: "0x9a20d5299ffd32053b7642ca57fc2305b2c3d671",
};

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESS: Record<DexChainId, Address> = {
  [DexChainId.CALLISTO]: "0xeAAfD389039229BB850F8F3a9CA5e5E1d53f3BeE",
  [DexChainId.SEPOLIA]: "0xc70b2f2Db899B8d0E73EE53Dbc4b40a12d0E2be5",
};
