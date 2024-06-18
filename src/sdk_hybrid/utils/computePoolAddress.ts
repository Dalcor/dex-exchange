import { defaultAbiCoder } from "@ethersproject/abi";
import { getCreate2Address } from "@ethersproject/address";
import { keccak256 } from "@ethersproject/solidity";
import { readContract } from "@wagmi/core";
import { useEffect, useMemo } from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";

import { FACTORY_ABI } from "@/config/abis/factory";
import { config } from "@/config/wagmi/config";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { ADDRESS_ZERO, FeeAmount } from "@/sdk_hybrid/constants";
import { usePoolAddresses } from "@/stores/usePoolsStore";

import { FACTORY_ADDRESS, POOL_INIT_CODE_HASH } from "../addresses";
import { DEX_SUPPORTED_CHAINS, DexChainId } from "../chains";
import { Token, TokenStandard } from "../entities/token";

/**
 * Computes a pool address
 * @deprecated deprecated
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

const cachedKeys = new Set<string>();
const computePoolAddressDex = async ({
  addressTokenA,
  addressTokenB,
  tier,
  chainId,
}: {
  addressTokenA: Address;
  addressTokenB: Address;
  tier: FeeAmount;
  chainId: DexChainId;
}) => {
  const key = getPoolAddressKey({
    addressTokenA,
    addressTokenB,
    chainId,
    tier,
  });

  if (cachedKeys.has(key) || !DEX_SUPPORTED_CHAINS.includes(chainId)) return undefined;
  cachedKeys.add(key);

  const poolContract = await readContract(config, {
    abi: FACTORY_ABI,
    address: FACTORY_ADDRESS[chainId],
    functionName: "getPool",
    args: [addressTokenA, addressTokenB, tier],
  });
  cachedKeys.delete(key);
  return poolContract;
};

// TODO: sort TokenA TokenB
export const getPoolAddressKey = ({
  addressTokenA,
  addressTokenB,
  tier,
  chainId,
}: {
  addressTokenA: Address;
  addressTokenB: Address;
  tier: FeeAmount;
  chainId: DexChainId;
}): string =>
  `${chainId}:${addressTokenA.toLowerCase()}:${addressTokenB.toLowerCase()}:${tier.toString()}`;

export const useComputePoolAddressDex = ({
  tokenA,
  tokenB,
  tier,
}: {
  tokenA?: Token;
  tokenB?: Token;
  tier?: FeeAmount;
}) => {
  const chainId = useCurrentChainId();
  const { addresses, addPoolAddress } = usePoolAddresses();

  const key = useMemo(() => {
    if (!tokenA || !tokenB || !tier || !chainId) {
      return;
    }
    return getPoolAddressKey({
      addressTokenA: tokenA?.address0,
      addressTokenB: tokenB?.address0,
      tier,
      chainId,
    });
  }, [tokenA, tokenB, tier, chainId]);

  const poolAddressFromStore = useMemo(() => {
    if (!key) return;
    return addresses[key];
  }, [addresses, key]);

  useEffect(() => {
    if (poolAddressFromStore || !tokenA || !tokenB || !tier || !chainId) {
      return;
    }
    const key = getPoolAddressKey({
      addressTokenA: tokenA.address0,
      addressTokenB: tokenB.address0,
      tier,
      chainId,
    });
    addPoolAddress(key, {
      address: undefined,
      isLoading: true,
    });
    computePoolAddressDex({
      addressTokenA: tokenA.address0,
      addressTokenB: tokenB.address0,
      tier,
      chainId,
    }).then((address) => {
      addPoolAddress(key, {
        address,
        isLoading: false,
      });
    });
  }, [poolAddressFromStore, tokenA, tokenB, tier, chainId, addPoolAddress]);

  return {
    poolAddress: poolAddressFromStore?.address,
    poolAddressLoading: poolAddressFromStore?.isLoading,
  };
};

export const useComputePoolAddressesDex = (
  params: {
    tokenA?: Token;
    tokenB?: Token;
    tier?: FeeAmount;
  }[],
) => {
  const chainId = useCurrentChainId();
  const { addresses, addPoolAddress } = usePoolAddresses();

  const keys = useMemo(() => {
    return params.map(({ tier, tokenA, tokenB }) => {
      if (!tokenA || !tokenB || !tier || !chainId) {
        return;
      }
      return getPoolAddressKey({
        addressTokenA: tokenA?.address0,
        addressTokenB: tokenB?.address0,
        tier,
        chainId,
      });
    });
  }, [params, chainId]);

  const poolAddressesFromStore = useMemo(() => {
    return keys.map((key) => (key ? addresses[key] : undefined));
  }, [addresses, keys]);

  useEffect(() => {
    params.map(({ tier, tokenA, tokenB }, index) => {
      const poolAddressFromStore = poolAddressesFromStore[index];
      if (poolAddressFromStore || !tokenA || !tokenB || !tier || !chainId) {
        return;
      }
      const key = getPoolAddressKey({
        addressTokenA: tokenA.address0,
        addressTokenB: tokenB.address0,
        tier,
        chainId,
      });
      addPoolAddress(key, {
        address: undefined,
        isLoading: true,
      });
      computePoolAddressDex({
        addressTokenA: tokenA.address0,
        addressTokenB: tokenB.address0,
        tier,
        chainId,
      }).then((address) => {
        addPoolAddress(key, {
          address,
          isLoading: false,
        });
      });
    });
  }, [poolAddressesFromStore, params, chainId, addPoolAddress]);

  return poolAddressesFromStore;
};
