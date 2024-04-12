import JSBI from "jsbi";

// exports for external consumption
export type BigintIsh = JSBI | string | number;

export enum TradeType {
  EXACT_INPUT,
  EXACT_OUTPUT,
}

export enum Rounding {
  ROUND_DOWN,
  ROUND_HALF_UP,
  ROUND_UP,
}

export const MaxUint256 = JSBI.BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
);

export const FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

// "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54"; — uniswap
export const POOL_INIT_CODE_HASH =
  "0xb7112e06e4c5b0e55a0560f43cfd041a98b718a5554606cfe637eb31021cc257";

/**
 * The default factory enabled fee amounts, denominated in hundredths of bips.
 */
export enum FeeAmount {
  LOWEST = 100,
  LOW = 500,
  MEDIUM = 3000,
  HIGH = 10000,
}

/**
 * The default factory tick spacings by fee amount.
 */
export const TICK_SPACINGS: { [amount in FeeAmount]: number } = {
  [FeeAmount.LOWEST]: 1,
  [FeeAmount.LOW]: 10,
  [FeeAmount.MEDIUM]: 60,
  [FeeAmount.HIGH]: 200,
};
