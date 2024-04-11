import { pack } from "@ethersproject/solidity";

import { Currency } from "@/sdk_hybrid/entities/currency";
import { Pool } from "@/sdk_hybrid/entities/pool";
import { Route } from "@/sdk_hybrid/entities/route";
import { Token } from "@/sdk_hybrid/entities/token";

/**
 * Converts a route to a hex encoded path
 * @param route the v3 path to convert to an encoded path
 * @param exactOutput whether the route should be encoded in reverse, for making exact output swaps
 */
export function encodeRouteToPath(route: Route<Currency, Currency>, exactOutput: boolean): string {
  const firstInputToken: Token = route.input.wrapped;

  const { path, types } = route.pools.reduce(
    (
      {
        inputToken,
        path,
        types,
      }: { inputToken: Token; path: (string | number)[]; types: string[] },
      pool: Pool,
      index,
    ): { inputToken: Token; path: (string | number)[]; types: string[] } => {
      const outputToken: Token = pool.token0.equals(inputToken) ? pool.token1 : pool.token0;
      if (index === 0) {
        return {
          inputToken: outputToken,
          types: ["address", "uint24", "address"],
          path: [inputToken.address0, pool.fee, outputToken.address0],
        };
      } else {
        return {
          inputToken: outputToken,
          types: [...types, "uint24", "address"],
          path: [...path, pool.fee, outputToken.address0],
        };
      }
    },
    { inputToken: firstInputToken, path: [], types: [] },
  );

  return exactOutput ? pack(types.reverse(), path.reverse()) : pack(types, path);
}
