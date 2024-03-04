import JSBI from 'jsbi'
import { ChainId } from "@/sdk/chains";
import { Address } from "viem";

// exports for external consumption
export type BigintIsh = JSBI | string | number

export enum TradeType {
  EXACT_INPUT,
  EXACT_OUTPUT
}

export enum Rounding {
  ROUND_DOWN,
  ROUND_HALF_UP,
  ROUND_UP
}

export const MaxUint256 = JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

export const FACTORY_ADDRESS = '0x1F98431c8aD98523631AE4a59f267346ea31F984'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

export const POOL_INIT_CODE_HASH = '0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54'

const DEPLOYER_ADDRESS = '0x41ff9AA7e16B8B1a8a8dc4f0eFacd93D02d071c9'

export const DEPLOYER_ADDRESSES = {
  [ChainId.MAINNET]: DEPLOYER_ADDRESS,
  [ChainId.GOERLI]: DEPLOYER_ADDRESS,
  [ChainId.ARBITRUM_ONE]: DEPLOYER_ADDRESS,
  [ChainId.ARBITRUM_GOERLI]: '0xbC465fbf687e4184103b67Ed86557A8155FA4343',
  [ChainId.BASE]: DEPLOYER_ADDRESS,
  [ChainId.SEPOLIA]: DEPLOYER_ADDRESS,
  [ChainId.ARBITRUM_SEPOLIA]: DEPLOYER_ADDRESS,
  [ChainId.ROOTSTOCK]: DEPLOYER_ADDRESS,
  [ChainId.ZORA]: DEPLOYER_ADDRESS,
  [ChainId.ZORA_SEPOLIA]: DEPLOYER_ADDRESS,
  [ChainId.AVALANCHE]: DEPLOYER_ADDRESS,
  [ChainId.BASE_GOERLI]: DEPLOYER_ADDRESS,
  [ChainId.POLYGON]: DEPLOYER_ADDRESS,
  [ChainId.POLYGON_MUMBAI]: DEPLOYER_ADDRESS,
  [ChainId.OPTIMISM_GOERLI]: DEPLOYER_ADDRESS,
  [ChainId.OPTIMISM_SEPOLIA]: DEPLOYER_ADDRESS,
  [ChainId.BNB]: DEPLOYER_ADDRESS,
  [ChainId.CELO]: DEPLOYER_ADDRESS,
  [ChainId.CELO_ALFAJORES]: DEPLOYER_ADDRESS,
  [ChainId.GNOSIS]: DEPLOYER_ADDRESS,
  [ChainId.OPTIMISM]: DEPLOYER_ADDRESS,
  [ChainId.MOONBEAM]: DEPLOYER_ADDRESS,
} as const satisfies Record<ChainId, Address>

/**
 * The default factory enabled fee amounts, denominated in hundredths of bips.
 */
export enum FeeAmount {
  LOWEST = 100,
  LOW = 500,
  MEDIUM = 3000,
  HIGH = 10000
}

/**
 * The default factory tick spacings by fee amount.
 */
export const TICK_SPACINGS: { [amount in FeeAmount]: number } = {
  [FeeAmount.LOWEST]: 1,
  [FeeAmount.LOW]: 10,
  [FeeAmount.MEDIUM]: 60,
  [FeeAmount.HIGH]: 200
}
