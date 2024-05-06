import { defaultAbiCoder } from "@ethersproject/abi";
import { getCreate2Address } from "@ethersproject/address";
import { keccak256 } from "@ethersproject/solidity";
import { readContract } from "@wagmi/core";
import { Address } from "viem";
import { useAccount, useChainId, useReadContract } from "wagmi";

import { FACTORY_ABI } from "@/config/abis/factory";
import { config } from "@/config/wagmi/config";
import { FeeAmount } from "@/sdk_hybrid/constants";

import { FACTORY_ADDRESS, POOL_INIT_CODE_HASH } from "../addresses";
import { DexChainId } from "../chains";
import { Token, TokenStandard } from "../entities/token";

/**
 * Computes a pool address
 * @param factoryAddress The Uniswap V3 factory address
 * @param tokenA The first token of the pair, irrespective of sort order
 * @param tokenB The second token of the pair, irrespective of sort order
 * @param fee The fee tier of the pool
 * @param initCodeHashManualOverride Override the init code hash used to compute the pool address if necessary
 * @returns The pool address
 */
export function computePoolAddress({
  factoryAddress,
  tokenA,
  tokenB,
  fee,
  standardA = "ERC-20",
  standardB = "ERC-20",
  initCodeHashManualOverride,
}: {
  factoryAddress: string;
  tokenA: Token;
  tokenB: Token;
  fee: FeeAmount;
  standardA: TokenStandard;
  standardB: TokenStandard;
  initCodeHashManualOverride?: string;
}): string {
  const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]; // does safety checks
  const token0Address = standardA === "ERC-20" ? token0.address0 : token0.address1;
  const token1Address = standardB === "ERC-20" ? token1.address0 : token1.address1;
  return getCreate2Address(
    factoryAddress,
    keccak256(
      ["bytes"],
      [
        defaultAbiCoder.encode(
          ["address", "address", "uint24"],
          [token0Address, token1Address, fee],
        ),
      ],
    ),
    initCodeHashManualOverride ?? POOL_INIT_CODE_HASH[DexChainId.SEPOLIA],
  );
}

export const computePoolAddressDex = async ({
  tokenA,
  tokenB,
  tier,
  chainId,
}: {
  tokenA: Token;
  tokenB: Token;
  tier: FeeAmount;
  chainId: DexChainId;
}) => {
  const poolContract = await readContract(config, {
    abi: FACTORY_ABI,
    address: FACTORY_ADDRESS[chainId],
    functionName: "getPool",
    args: [tokenA.address0 as Address, tokenB.address0 as Address, tier],
  });

  return poolContract;
};
