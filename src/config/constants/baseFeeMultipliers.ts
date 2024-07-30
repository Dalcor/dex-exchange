import { GasOption } from "@/app/[locale]/swap/stores/useSwapGasSettingsStore";
import { DexChainId } from "@/sdk_hybrid/chains";

type GasOptionWithoutCustom = Exclude<GasOption, GasOption.CUSTOM>;

export const baseFeeMultipliers: Record<DexChainId, Record<GasOptionWithoutCustom, bigint>> = {
  [DexChainId.SEPOLIA]: {
    [GasOption.CHEAP]: BigInt(120),
    [GasOption.FAST]: BigInt(200),
  },
  [DexChainId.BSC_TESTNET]: {
    [GasOption.CHEAP]: BigInt(120),
    [GasOption.FAST]: BigInt(200),
  },
  [DexChainId.EOS_TESTNET]: {
    [GasOption.CHEAP]: BigInt(120),
    [GasOption.FAST]: BigInt(200),
  },
};

export const SCALING_FACTOR = BigInt(100);

export const eip1559SupportMap: Record<DexChainId, boolean> = {
  [DexChainId.SEPOLIA]: true,
  [DexChainId.EOS_TESTNET]: true,
  [DexChainId.BSC_TESTNET]: false,
};

export function isEip1559Supported(chainId: DexChainId) {
  return eip1559SupportMap[chainId];
}
