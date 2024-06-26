import JSBI from "jsbi";
import { useCallback, useEffect, useMemo } from "react";
import { Abi, Address, encodeFunctionData, formatUnits, getAbiItem, parseUnits } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import { useAddLiquidityTokensStore } from "@/app/[locale]/add/stores/useAddLiquidityTokensStore";
import { useLiquidityTierStore } from "@/app/[locale]/add/stores/useLiquidityTierStore";
import { NONFUNGIBLE_POSITION_MANAGER_ABI } from "@/config/abis/nonfungiblePositionManager";
import { tryParseCurrencyAmount } from "@/functions/tryParseTick";
import { PoolState, usePool } from "@/hooks/usePools";
import useTransactionDeadline from "@/hooks/useTransactionDeadline";
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/sdk_hybrid/addresses";
import { DexChainId } from "@/sdk_hybrid/chains";
import { FeeAmount } from "@/sdk_hybrid/constants";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { CurrencyAmount } from "@/sdk_hybrid/entities/fractions/currencyAmount";
import { Percent } from "@/sdk_hybrid/entities/fractions/percent";
import { Price } from "@/sdk_hybrid/entities/fractions/price";
import { Pool } from "@/sdk_hybrid/entities/pool";
import { Position } from "@/sdk_hybrid/entities/position";
import { Token } from "@/sdk_hybrid/entities/token";
import { toHex } from "@/sdk_hybrid/utils/calldata";
import { encodeSqrtRatioX96 } from "@/sdk_hybrid/utils/encodeSqrtRatioX96";
import { priceToClosestTick } from "@/sdk_hybrid/utils/priceTickConversions";
import { TickMath } from "@/sdk_hybrid/utils/tickMath";
import {
  GasFeeModel,
  RecentTransactionTitleTemplate,
  stringifyObject,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";
import { useTransactionSettingsStore } from "@/stores/useTransactionSettingsStore";

import {
  Field,
  useLiquidityAmountsStore,
  useTokensStandards,
} from "../stores/useAddLiquidityAmountsStore";
import { useLiquidityPriceRangeStore } from "../stores/useLiquidityPriceRangeStore";

export const useAddLiquidity = () => {
  const { slippage, deadline: _deadline } = useTransactionSettingsStore();
  const deadline = useTransactionDeadline(_deadline);
  const { tokenA, tokenB, setTokenA, setTokenB } = useAddLiquidityTokensStore();
  const { address: accountAddress, chainId } = useAccount();
  const { addRecentTransaction } = useRecentTransactionsStore();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { tier, setTier } = useLiquidityTierStore();

  const handleTokenAChange = useCallback(() => {}, []);

  const handleTokenBChange = useCallback(() => {}, []);

  const handleAmountAChange = useCallback(() => {}, []);

  const handleAmountBChange = useCallback(() => {}, []);

  const handleAddLiquidity = useCallback(
    async ({
      position,
      increase,
      createPool,
      tokenId,
    }: {
      position?: Position;
      increase?: boolean;
      createPool?: boolean;
      tokenId?: string;
    }) => {
      if (
        !position ||
        !publicClient ||
        !walletClient ||
        !accountAddress ||
        !tokenA ||
        !tokenB ||
        !chainId
      ) {
        console.log("handleAddLiquidity: SOMESING UNDEFINED");
        return;
      }
      const callData = [];

      try {
        // const estimatedGas = await publicClient.estimateContractGas(params as any);
        //
        // const { request } = await publicClient.simulateContract({
        //   ...(params as any),
        //   gas: estimatedGas + BigInt(30000),
        // });

        const TEST_ALLOWED_SLIPPAGE = new Percent(2, 100);

        // get amounts
        const { amount0: amount0Desired, amount1: amount1Desired } = position.mintAmounts;

        // adjust for slippage
        const minimumAmounts = position.mintAmountsWithSlippage(TEST_ALLOWED_SLIPPAGE); // options.slippageTolerance
        const amount0Min = toHex(minimumAmounts.amount0);
        const amount1Min = toHex(minimumAmounts.amount1);

        if (createPool) {
          const createParams = [
            position.pool.token0.address0,
            position.pool.token1.address0,
            position.pool.token0.address1,
            position.pool.token1.address1,
            position.pool.fee,
            toHex(position.pool.sqrtRatioX96) as any,
          ] as [Address, Address, Address, Address, FeeAmount, bigint];

          const mintParams = {
            token0: position.pool.token0.address0,
            token1: position.pool.token1.address0,
            fee: position.pool.fee,
            tickLower: position.tickLower,
            tickUpper: position.tickUpper,
            amount0Desired: toHex(amount0Desired) as any,
            amount1Desired: toHex(amount1Desired) as any,
            amount0Min: amount0Min as any,
            amount1Min: amount1Min as any,
            recipient: accountAddress,
            deadline,
          };

          // Without multicall start
          // const hash1 = await walletClient.writeContract({
          //   account: accountAddress,
          //   abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
          //   functionName: "createAndInitializePoolIfNecessary" as const,
          //   address: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
          //   args: createParams,
          // });

          // const hash2 = await walletClient.writeContract({
          //   account: accountAddress,
          //   abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
          //   functionName: "mint" as const,
          //   address: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
          //   args: [mintParams],
          // });

          // const params2 = {
          //   account: accountAddress,
          //   abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
          //   functionName: "mint" as const,
          //   address: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
          //   args: [mintParams] as any,
          // };

          // const estimatedGas = await publicClient.estimateContractGas(params2);

          // const { request } = await publicClient.simulateContract({
          //   ...params2,
          //   gas: estimatedGas + BigInt(30000),
          // });

          // Without multicall end

          const encodedCreateParams = encodeFunctionData({
            abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
            functionName: "createAndInitializePoolIfNecessary",
            args: createParams,
          });

          const encodedMintParams = encodeFunctionData({
            abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
            functionName: "mint",
            args: [mintParams],
          });

          const params: {
            address: Address;
            account: Address;
            abi: Abi;
            functionName: "multicall";
            args: [`0x${string}`[]];
          } = {
            address: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
            account: accountAddress,
            abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
            functionName: "multicall" as const,
            args: [[encodedCreateParams, encodedMintParams]],
          };

          const estimatedGas = await publicClient.estimateContractGas(params);

          const { request } = await publicClient.simulateContract({
            ...params,
            gas: estimatedGas + BigInt(30000),
          });
          const hash = await walletClient.writeContract(request);

          const nonce = await publicClient.getTransactionCount({
            address: accountAddress,
            blockTag: "pending",
          });

          addRecentTransaction(
            {
              hash,
              nonce,
              chainId,
              gas: {
                model: GasFeeModel.EIP1559,
                gas: (estimatedGas + BigInt(30000)).toString(),
                maxFeePerGas: undefined,
                maxPriorityFeePerGas: undefined,
              },
              params: {
                ...stringifyObject(params),
                abi: [getAbiItem({ name: "multicall", abi: NONFUNGIBLE_POSITION_MANAGER_ABI })],
              },
              title: {
                template: RecentTransactionTitleTemplate.ADD,
                symbol0: position.pool.token0.symbol!,
                symbol1: position.pool.token1.symbol!,
                amount0: formatUnits(
                  BigInt(JSBI.toNumber(amount0Desired)),
                  position.pool.token0.decimals,
                ),
                amount1: formatUnits(
                  BigInt(JSBI.toNumber(amount1Desired)),
                  position.pool.token1.decimals,
                ),
                logoURI0: position.pool.token0?.logoURI || "/tokens/placeholder.svg",
                logoURI1: position.pool.token1?.logoURI || "/tokens/placeholder.svg",
              },
            },
            accountAddress,
          );
        } else if (increase) {
          if (tokenId) {
            const increaseParams = {
              tokenId: toHex(tokenId) as any,
              amount0Desired: toHex(amount0Desired) as any,
              amount1Desired: toHex(amount1Desired) as any,
              amount0Min: amount0Min as any,
              amount1Min: amount1Min as any,
              recipient: accountAddress,
              deadline,
            };

            const params: {
              address: Address;
              account: Address;
              abi: Abi;
              functionName: "increaseLiquidity";
              args: [
                {
                  tokenId: any;
                  amount0Desired: any;
                  amount1Desired: any;
                  amount0Min: any;
                  amount1Min: any;
                  recipient: `0x${string}`;
                  deadline: bigint;
                },
              ];
            } = {
              address: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
              account: accountAddress,
              abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
              functionName: "increaseLiquidity" as const,
              args: [increaseParams],
            };

            const estimatedGas = await publicClient.estimateContractGas(params);

            const { request } = await publicClient.simulateContract({
              ...params,
              gas: estimatedGas + BigInt(30000),
            });
            const hash = await walletClient.writeContract(request);

            const nonce = await publicClient.getTransactionCount({
              address: accountAddress,
              blockTag: "pending",
            });

            addRecentTransaction(
              {
                hash,
                nonce,
                chainId,
                gas: {
                  model: GasFeeModel.EIP1559,
                  gas: (estimatedGas + BigInt(30000)).toString(),
                  maxFeePerGas: undefined,
                  maxPriorityFeePerGas: undefined,
                },
                params: {
                  ...stringifyObject(params),
                  abi: [
                    getAbiItem({
                      name: "increaseLiquidity",
                      abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
                    }),
                  ],
                },
                title: {
                  template: RecentTransactionTitleTemplate.ADD,
                  symbol0: position.pool.token0.symbol!,
                  symbol1: position.pool.token1.symbol!,
                  amount0: formatUnits(
                    BigInt(JSBI.toNumber(amount0Desired)),
                    position.pool.token0.decimals,
                  ),
                  amount1: formatUnits(
                    BigInt(JSBI.toNumber(amount1Desired)),
                    position.pool.token1.decimals,
                  ),
                  logoURI0: position.pool.token0?.logoURI || "/tokens/placeholder.svg",
                  logoURI1: position.pool.token1?.logoURI || "/tokens/placeholder.svg",
                },
              },
              accountAddress,
            );
          }
        } else {
          const mintParams = {
            token0: position.pool.token0.address0,
            token1: position.pool.token1.address0,
            fee: position.pool.fee,
            tickLower: position.tickLower,
            tickUpper: position.tickUpper,
            amount0Desired: toHex(amount0Desired) as any,
            amount1Desired: toHex(amount1Desired) as any,
            amount0Min: amount0Min as any,
            amount1Min: amount1Min as any,
            recipient: accountAddress,
            deadline,
          };

          const params: {
            address: Address;
            account: Address;
            abi: Abi;
            functionName: "mint";
            args: [any];
          } = {
            address: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
            account: accountAddress,
            abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
            functionName: "mint" as const,
            args: [mintParams],
          };

          const estimatedGas = await publicClient.estimateContractGas(params);

          const { request } = await publicClient.simulateContract({
            ...params,
            gas: estimatedGas + BigInt(30000),
          });
          const hash = await walletClient.writeContract(request);

          const nonce = await publicClient.getTransactionCount({
            address: accountAddress,
            blockTag: "pending",
          });

          addRecentTransaction(
            {
              hash,
              nonce,
              chainId,
              gas: {
                model: GasFeeModel.EIP1559,
                gas: (estimatedGas + BigInt(30000)).toString(),
                maxFeePerGas: undefined,
                maxPriorityFeePerGas: undefined,
              },
              params: {
                ...stringifyObject(params),
                abi: [
                  getAbiItem({
                    name: "mint",
                    abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
                  }),
                ],
              },
              title: {
                template: RecentTransactionTitleTemplate.ADD,
                symbol0: position.pool.token0.symbol!,
                symbol1: position.pool.token1.symbol!,
                amount0: formatUnits(
                  BigInt(JSBI.toNumber(amount0Desired)),
                  position.pool.token0.decimals,
                ),
                amount1: formatUnits(
                  BigInt(JSBI.toNumber(amount1Desired)),
                  position.pool.token1.decimals,
                ),
                logoURI0: position.pool.token0?.logoURI || "/tokens/placeholder.svg",
                logoURI1: position.pool.token1?.logoURI || "/tokens/placeholder.svg",
              },
            },
            accountAddress,
          );
        }
      } catch (error) {
        console.error("useAddLiquidity ~ error:", error);
      }
    },
    [
      accountAddress,
      deadline,
      publicClient,
      tokenA,
      tokenB,
      walletClient,
      chainId,
      addRecentTransaction,
    ],
  );

  return {
    handleTokenAChange,
    handleTokenBChange,
    handleAmountAChange,
    handleAmountBChange,
    handleAddLiquidity,
  };
};

const BIG_INT_ZERO = JSBI.BigInt(0);

export const useV3DerivedMintInfo = ({
  tokenA,
  tokenB,
  tier,
  price,
}: {
  tokenA?: Token;
  tokenB?: Token;
  tier: FeeAmount;
  price: Price<Token, Token> | undefined;
}) => {
  const { ticks } = useLiquidityPriceRangeStore();
  const { LOWER: tickLower, UPPER: tickUpper } = ticks;
  const { chainId } = useAccount();
  // mark invalid range
  const invalidRange = Boolean(
    typeof tickLower === "number" && typeof tickUpper === "number" && tickLower >= tickUpper,
  );
  const { typedValue, independentField, dependentField, setTypedValue } =
    useLiquidityAmountsStore();

  const [poolState, pool] = usePool(tokenA, tokenB, tier);
  const noLiquidity = poolState === PoolState.NOT_EXISTS;

  const currencyA = tokenA;
  const currencyB = tokenB;

  const currencies = {
    [Field.CURRENCY_A]: tokenA,
    [Field.CURRENCY_B]: tokenB,
  };

  // check if price is within range
  const outOfRange: boolean =
    pool && typeof tickLower === "number" && typeof tickUpper === "number"
      ? pool.tickCurrent < tickLower || pool.tickCurrent >= tickUpper
      : false;

  // check for invalid price input (converts to invalid ratio)
  const invalidPrice = useMemo(() => {
    const sqrtRatioX96 = price ? encodeSqrtRatioX96(price.numerator, price.denominator) : undefined;
    return (
      price &&
      sqrtRatioX96 &&
      !(
        JSBI.greaterThanOrEqual(sqrtRatioX96, TickMath.MIN_SQRT_RATIO) &&
        JSBI.lessThan(sqrtRatioX96, TickMath.MAX_SQRT_RATIO)
      )
    );
  }, [price]);

  // used for ratio calculation when pool not initialized
  const mockPool = useMemo(() => {
    if (tokenA && tokenB && tier && price && !invalidPrice) {
      const currentTick = priceToClosestTick(price);
      const currentSqrt = TickMath.getSqrtRatioAtTick(currentTick);
      return new Pool(tokenA, tokenB, tier, currentSqrt, JSBI.BigInt(0), currentTick, []);
    } else {
      return undefined;
    }
  }, [tier, invalidPrice, price, tokenA, tokenB]);

  // if pool exists use it, if not use the mock pool
  const poolForPosition: Pool | undefined = pool ?? mockPool;

  // amounts
  const independentAmount: CurrencyAmount<Currency> | undefined = tryParseCurrencyAmount(
    typedValue,
    currencies[independentField],
  );

  const dependentAmount: CurrencyAmount<Currency> | undefined = useMemo(() => {
    // we wrap the currencies just to get the price in terms of the other token
    const wrappedIndependentAmount = independentAmount?.wrapped;
    const dependentCurrency = dependentField === Field.CURRENCY_B ? currencyB : currencyA;

    if (
      independentAmount &&
      wrappedIndependentAmount &&
      typeof tickLower === "number" &&
      typeof tickUpper === "number" &&
      poolForPosition
    ) {
      // if price is out of range or invalid range - return 0 (single deposit will be independent)
      if (outOfRange || invalidRange) {
        return undefined;
      }
      const position: Position | undefined = wrappedIndependentAmount.currency.equals(
        poolForPosition.token0,
      )
        ? Position.fromAmount0({
            pool: poolForPosition,
            tickLower,
            tickUpper,
            amount0: independentAmount.quotient,
            useFullPrecision: true, // we want full precision for the theoretical position
          })
        : Position.fromAmount1({
            pool: poolForPosition,
            tickLower,
            tickUpper,
            amount1: independentAmount.quotient,
          });

      const dependentTokenAmount = wrappedIndependentAmount.currency.equals(poolForPosition.token0)
        ? position.amount1
        : position.amount0;
      return (
        dependentCurrency &&
        CurrencyAmount.fromRawAmount(dependentCurrency, dependentTokenAmount.quotient)
      );
    }

    return undefined;
  }, [
    independentAmount,
    outOfRange,
    dependentField,
    currencyB,
    currencyA,
    tickLower,
    tickUpper,
    poolForPosition,
    invalidRange,
  ]);

  const parsedAmounts: { [field in Field]: CurrencyAmount<Currency> | undefined } = useMemo(() => {
    return {
      [Field.CURRENCY_A]:
        independentField === Field.CURRENCY_A ? independentAmount : dependentAmount,
      [Field.CURRENCY_B]:
        independentField === Field.CURRENCY_A ? dependentAmount : independentAmount,
    };
  }, [dependentAmount, independentAmount, independentField]);

  // single deposit only if price is out of range
  const deposit0Disabled = Boolean(
    typeof tickUpper === "number" && poolForPosition && poolForPosition.tickCurrent >= tickUpper,
  );
  const deposit1Disabled = Boolean(
    typeof tickLower === "number" && poolForPosition && poolForPosition.tickCurrent <= tickLower,
  );

  // sorted for token order
  const depositADisabled =
    invalidRange ||
    Boolean(
      (deposit0Disabled && poolForPosition && tokenA && poolForPosition.token0.equals(tokenA)) ||
        (deposit1Disabled && poolForPosition && tokenA && poolForPosition.token1.equals(tokenA)),
    );
  const depositBDisabled =
    invalidRange ||
    Boolean(
      (deposit0Disabled && poolForPosition && tokenB && poolForPosition.token0.equals(tokenB)) ||
        (deposit1Disabled && poolForPosition && tokenB && poolForPosition.token1.equals(tokenB)),
    );

  // create position entity based on users selection
  const position: Position | undefined = useMemo(() => {
    if (
      !poolForPosition ||
      !tokenA ||
      !tokenB ||
      typeof tickLower !== "number" ||
      typeof tickUpper !== "number" ||
      invalidRange
    ) {
      return undefined;
    }

    // mark as 0 if disabled because out of range
    const amount0 = !deposit0Disabled
      ? parsedAmounts?.[tokenA.equals(poolForPosition.token0) ? Field.CURRENCY_A : Field.CURRENCY_B]
          ?.quotient
      : BIG_INT_ZERO;
    const amount1 = !deposit1Disabled
      ? parsedAmounts?.[tokenA.equals(poolForPosition.token0) ? Field.CURRENCY_B : Field.CURRENCY_A]
          ?.quotient
      : BIG_INT_ZERO;

    if (amount0 !== undefined && amount1 !== undefined) {
      return Position.fromAmounts({
        pool: poolForPosition,
        tickLower,
        tickUpper,
        amount0,
        amount1,
        useFullPrecision: true, // we want full precision for the theoretical position
      });
    } else {
      return undefined;
    }
  }, [
    parsedAmounts,
    poolForPosition,
    tokenA,
    tokenB,
    deposit0Disabled,
    deposit1Disabled,
    invalidRange,
    tickLower,
    tickUpper,
  ]);

  return {
    parsedAmounts,
    position,
    currencies,
    noLiquidity,
    outOfRange,
    depositADisabled,
    depositBDisabled,
  };
};
