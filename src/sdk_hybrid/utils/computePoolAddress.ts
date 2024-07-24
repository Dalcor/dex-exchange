import { readContract } from "@wagmi/core";
import { useEffect, useMemo } from "react";
import {
  Address,
  encodeAbiParameters,
  encodePacked,
  getContractAddress,
  keccak256,
  parseAbiParameters,
} from "viem";

import { FACTORY_ABI } from "@/config/abis/factory";
import { config } from "@/config/wagmi/config";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { FeeAmount } from "@/sdk_hybrid/constants";
import { getTokenAddressForStandard, Standard } from "@/sdk_hybrid/standard";
import { usePoolAddresses } from "@/stores/usePoolsStore";

import { FACTORY_ADDRESS, POOL_INIT_CODE_HASH } from "../addresses";
import { DEX_SUPPORTED_CHAINS, DexChainId } from "../chains";
import { Token } from "../entities/token";

/**
 * Computes a pool address
 * @deprecated deprecated
 * @param factoryAddress The Uniswap V3 factory address
 * @param tokenA The first token of the pair, irrespective of sort order
 * @param standardA First token standard
 * @param tokenB The second token of the pair, irrespective of sort order
 * @param standardB Second token standard
 * @param fee The fee tier of the pool
 * @param initCodeHashManualOverride Override the init code hash used to compute the pool address if necessary
 * @returns The pool address
 */
export function computePoolAddress({
  factoryAddress,
  tokenA,
  tokenB,
  fee,
  standardA = Standard.ERC20,
  standardB = Standard.ERC20,
  initCodeHashManualOverride,
}: {
  factoryAddress: Address;
  tokenA: Token;
  tokenB: Token;
  fee: FeeAmount;
  standardA: Standard;
  standardB: Standard;
  initCodeHashManualOverride?: Address;
}): string {
  const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]; // does safety checks
  const [standard0, standard1] = tokenA.sortsBefore(tokenB)
    ? [standardA, standardB]
    : [standardB, standardA];

  return getContractAddress({
    from: factoryAddress,
    salt: keccak256(
      encodePacked(
        ["bytes"],
        [
          encodeAbiParameters(parseAbiParameters("address, address, uint24"), [
            getTokenAddressForStandard(token0, standard0),
            getTokenAddressForStandard(token1, standard1),
            fee,
          ]),
        ],
      ),
    ),
    bytecode: initCodeHashManualOverride ?? POOL_INIT_CODE_HASH[DexChainId.SEPOLIA],
    opcode: "CREATE2",
  });
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
