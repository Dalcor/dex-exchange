"use client";

import clsx from "clsx";
import JSBI from "jsbi";
import Image from "next/image";
import { useLocale } from "next-intl";
import { ButtonHTMLAttributes, useCallback, useEffect, useMemo, useState } from "react";
import { Address, formatUnits, parseUnits } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import FeeAmountSettings from "@/app/[locale]/add/components/FeeAmountSettings";
import TokenDepositCard from "@/app/[locale]/add/components/TokenDepositCard";
import { PoolState } from "@/app/[locale]/add/hooks/types";
import { useAddLiquidityTokensStore } from "@/app/[locale]/add/hooks/useAddLiquidityTokensStore";
import { useLiquidityTierStore } from "@/app/[locale]/add/hooks/useLiquidityTierStore";
import Button from "@/components/atoms/Button";
import Collapse from "@/components/atoms/Collapse";
import Container from "@/components/atoms/Container";
import SelectButton from "@/components/atoms/SelectButton";
import Svg from "@/components/atoms/Svg";
import IncrementDecrementIconButton from "@/components/buttons/IncrementDecrementIconButton";
import SystemIconButton from "@/components/buttons/SystemIconButton";
import ZoomButton from "@/components/buttons/ZoomButton";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import { NONFUNGIBLE_POSITION_MANAGER_ABI } from "@/config/abis/nonfungiblePositionManager";
import { FEE_AMOUNT_DETAIL, FEE_TIERS } from "@/config/constants/liquidityFee";
import { WrappedToken } from "@/config/types/WrappedToken";
import useAllowance from "@/hooks/useAllowance";
import { usePool, usePools } from "@/hooks/usePools";
import { useTokens } from "@/hooks/useTokenLists";
import useTransactionDeadline from "@/hooks/useTransactionDeadline";
import { useRouter } from "@/navigation";
import { FeeAmount } from "@/sdk";
import { SqrtPriceMath } from "@/sdk/utils/sqrtPriceMath";
import { TickMath } from "@/sdk/utils/tickMath";
import { useTransactionSettingsStore } from "@/stores/useTransactionSettingsStore";

const nonFungiblePositionManagerAddress = "0x1238536071e1c677a632429e3655c799b22cda52";

function PriceRangeCard() {
  return (
    <div className="bg-secondary-bg border border-secondary-border rounded-1 p-5 flex justify-between items-center">
      <div className="flex flex-col gap-1">
        <span className="text-12 text-secondary-text">Low price</span>
        <input
          className="font-medium text-16 bg-transparent border-0 outline-0"
          type="text"
          value={906.56209}
        />
        <span className="text-12 text-secondary-text">DAI per ETH</span>
      </div>
      <div className="flex flex-col gap-2">
        <IncrementDecrementIconButton icon="add" />
        <IncrementDecrementIconButton icon="minus" />
      </div>
    </div>
  );
}

function DepositCard() {
  return (
    <div className="bg-secondary-bg border border-secondary-border rounded-1 p-5">
      <div className="flex items-center justify-between mb-1">
        <input
          className="font-medium text-16 bg-transparent border-0 outline-0 min-w-0"
          type="text"
          defaultValue={906.56209}
        />
        <div className="pr-3 py-1 pl-1 bg-primary-bg rounded-5 flex items-center gap-2 flex-shrink-0">
          <Image src="/tokens/ETH.svg" alt="Ethereum" width={24} height={24} />
          MATIC
        </div>
      </div>
      <div className="flex justify-between items-center text-12">
        <span>—</span>
        <span>Balance: 23.245 ETH</span>
      </div>
    </div>
  );
}

const recipient = "0xF1602175601606E8ffEe38CE433A4DB4C6cf5d60";

export default function AddPoolPage({
  params,
}: {
  params: {
    currency: [string, string, string];
  };
}) {
  const [isOpenedTokenPick, setIsOpenedTokenPick] = useState(false);
  const router = useRouter();

  const { address: accountAddress } = useAccount();

  const currency = params.currency;

  const { slippage, deadline: _deadline } = useTransactionSettingsStore();

  const deadline = useTransactionDeadline(_deadline);

  const { tokenA, tokenB, setTokenA, setTokenB } = useAddLiquidityTokensStore();

  const tokens = useTokens();

  // const { isLoading, isError, largestUsageFeeTier, distributions } = useFeeTierDistribution(tokenA, tokenB);
  //
  // const { currencyIdA, currencyIdB, feeAmount } = useCurrencyParams();
  //

  const poolKeys: any = useMemo(() => {
    return [
      [tokenA, tokenB, FeeAmount.LOWEST],
      [tokenA, tokenB, FeeAmount.LOW],
      [tokenA, tokenB, FeeAmount.MEDIUM],
      [tokenA, tokenB, FeeAmount.HIGH],
    ];
  }, [tokenA, tokenB]);

  // get pool data on-chain for latest states
  const pools = usePools(poolKeys);

  const pool = usePool(tokenA, tokenB, FeeAmount.LOWEST);

  //
  // useEffect(() => {
  //   console.log("Effect pools");
  //   if (pool && pool[1]) {
  //     console.log(pool[1]);
  //     const a = SqrtPriceMath.getNextSqrtPriceFromInput(
  //       pool[1].sqrtRatioX96,
  //       pool[1].liquidity,
  //       JSBI.BigInt(1),
  //       true,
  //     );
  //
  //     console.log("Output estimation:" + a);
  //   }
  // }, [pool]);

  const poolsByFeeTier: Record<FeeAmount, PoolState> = useMemo(
    () =>
      pools.reduce(
        (acc, [curPoolState, curPool]) => {
          acc = {
            ...acc,
            ...{ [curPool?.fee as FeeAmount]: curPoolState },
          };
          return acc;
        },
        {
          // default all states to NOT_EXISTS
          [FeeAmount.LOWEST]: PoolState.NOT_EXISTS,
          [FeeAmount.LOW]: PoolState.NOT_EXISTS,
          [FeeAmount.MEDIUM]: PoolState.NOT_EXISTS,
          [FeeAmount.HIGH]: PoolState.NOT_EXISTS,
        },
      ),
    [pools],
  );

  const { setIsOpen } = useTransactionSettingsDialogStore();

  const { tier, setTier } = useLiquidityTierStore();

  const lang = useLocale();

  const [currentlyPicking, setCurrentlyPicking] = useState<"tokenA" | "tokenB">("tokenA");

  const handlePick = useCallback(
    (token: WrappedToken) => {
      if (currentlyPicking === "tokenA") {
        setTokenA(token);
        if (tokenB) {
          const newPath = `/${lang}/add/${token.address}/${tokenB.address}`;
          window.history.replaceState(null, "", newPath);
        } else {
          const newPath = `/${lang}/add/${token.address}`;
          window.history.replaceState(null, "", newPath);
        }
      }

      if (currentlyPicking === "tokenB") {
        setTokenB(token);
        if (tokenA) {
          const newPath = `/${lang}/add/${tokenA.address}/${token.address}`;
          window.history.replaceState(null, "", newPath);
        } else {
          const newPath = `/${lang}/add/undefined/${token.address}`;
          window.history.replaceState(null, "", newPath);
        }
      }

      setIsOpenedTokenPick(false);
    },
    [currentlyPicking, lang, setTokenA, setTokenB, tokenA, tokenB],
  );

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    if (currency?.[0]) {
      const token = tokens.find((t) => t.address === currency[0]);
      if (token) {
        setTokenA(token);
      }
    }

    if (currency?.[1]) {
      const token = tokens.find((t) => t.address === currency[1]);
      if (token) {
        setTokenB(token);
      }
    }

    if (currency?.[2]) {
      if (FEE_TIERS.includes(Number(currency[2]))) {
        setTier(Number(currency[2]));
      }
    }
  }, [currency, setTier, setTokenA, setTokenB, tokens]);

  const [mainPriceToken, setMainPriceToken] = useState("DAI");
  const [fullRange, setFullRange] = useState(false);

  const {
    isAllowed: isAllowedA,
    writeTokenApprove: approveA,
    isApproving: isApprovingA,
  } = useAllowance({
    token: tokenA,
    contractAddress: nonFungiblePositionManagerAddress,
    amountToCheck: parseUnits("1", tokenA?.decimals || 18),
  });

  const {
    isAllowed: isAllowedB,
    writeTokenApprove: approveB,
    isApproving: isApprovingB,
  } = useAllowance({
    token: tokenB,
    contractAddress: nonFungiblePositionManagerAddress,
    amountToCheck: parseUnits("1", tokenB?.decimals || 18),
  });

  const handleAddLiquidity = useCallback(async () => {
    if (!publicClient || !walletClient || !accountAddress || !tokenA || !tokenB) {
      return;
    }

    // const initializeParams = {
    //   account: accountAddress,
    //   abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
    //   functionName: "createAndInitializePoolIfNecessary" as const,
    //   address: nonFungiblePositionManagerAddress as Address,
    //   args: [tokenA.address, tokenB.address, FeeAmount.LOW, 1],
    // };
    //
    // try {
    //   // const estimatedGas = await publicClient.estimateContractGas(initializeParams as any);
    //   //
    //   // const { request } = await publicClient.simulateContract({
    //   //   ...(initializeParams as any),
    //   //   gas: estimatedGas + BigInt(30000),
    //   // });
    //   const hash = await walletClient.writeContract({
    //     account: accountAddress,
    //     abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
    //     functionName: "createAndInitializePoolIfNecessary" as const,
    //     address: nonFungiblePositionManagerAddress as Address,
    //     args: [tokenA.address, tokenB.address, FeeAmount.LOW, BigInt(1)],
    //     gas: BigInt(10_000_000),
    //   });
    //   console.log("POOL INITIALIZES");
    //   console.log(hash);
    // } catch (e) {
    //   console.log(e);
    // }
    //
    // const data = encodeFunctionData({
    //   abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
    //   functionName: "mint",
    //   args: [
    //     {
    //       token0: tokenA.address as Address,
    //       token1: tokenB.address as Address,
    //       fee: tier,
    //       tickLower: 400000,
    //       tickUpper: 100000,
    //       amount0Desired: BigInt(1),
    //       amount1Desired: BigInt(1),
    //       amount0Min: BigInt(1),
    //       amount1Min: BigInt(1),
    //       recipient,
    //       deadline,
    //     },
    //   ],
    // });

    // const params = {
    //   account: accountAddress,
    //   abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
    //   functionName: "mint" as const,
    //   address: nonFungiblePositionManagerAddress as Address,
    //   args: [
    //     {
    //       token0: tokenB.address as Address,
    //       token1: tokenA.address as Address,
    //       fee: tier,
    //       tickLower: TickMath.MIN_TICK,
    //       tickUpper: TickMath.MAX_TICK,
    //       amount0Desired: parseUnits("1", tokenB.decimals),
    //       amount1Desired: parseUnits("1", tokenA.decimals),
    //       amount0Min: 0,
    //       amount1Min: 0,
    //       recipient,
    //       deadline: deadline,
    //     },
    //   ],
    // };

    try {
      // const estimatedGas = await publicClient.estimateContractGas(params as any);
      //
      // const { request } = await publicClient.simulateContract({
      //   ...(params as any),
      //   gas: estimatedGas + BigInt(30000),
      // });
      const hash = await walletClient.writeContract({
        account: accountAddress,
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        functionName: "mint" as const,
        address: nonFungiblePositionManagerAddress as Address,
        args: [
          {
            token0: tokenB.address as Address, // correct
            token1: tokenA.address as Address, // correct
            fee: tier,
            tickLower: TickMath.MIN_TICK,
            tickUpper: TickMath.MAX_TICK,
            amount0Desired: BigInt(1),
            amount1Desired: BigInt(1) / BigInt("75999999999781595658"),
            amount0Min: BigInt(0),
            amount1Min: BigInt(0),
            recipient,
            deadline: deadline,
          },
        ],
      });
    } catch (e) {
      console.log(e);
    }
  }, [accountAddress, deadline, publicClient, tier, tokenA, tokenB, walletClient]);

  const a = useMemo(() => {
    if (!pool[1]) {
      return null;
    }
    const data = SqrtPriceMath.getNextSqrtPriceFromInput(
      pool[1]?.sqrtRatioX96,
      JSBI.BigInt(3338),
      JSBI.BigInt(10),
      true,
    );
    if (data) {
    }

    return data;
  }, [pool]);

  console.log("Price output");
  useEffect(() => {
    if (pool[1]) {
      const expon = JSBI.exponentiate(pool[1].sqrtRatioX96, JSBI.BigInt(2));
      const divider = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(192));

      console.log("PRICE CALCULATEION");
      console.log(expon);
      console.log(divider.toString());
      console.log(JSBI.divide(expon, divider).toString());
    }
  }, [pool]);

  return (
    <Container>
      <div className="w-[1200px] bg-primary-bg mx-auto my-[80px]">
        <div className="flex justify-between items-center rounded-t-2 border py-2.5 px-6 border-secondary-border">
          <SystemIconButton
            iconSize={32}
            iconName="back"
            size="large"
            onClick={() => router.push("/pools")}
          />
          <h2 className="text-20 font-bold">Add Liquidity</h2>
          <SystemIconButton
            iconSize={32}
            size="large"
            iconName="settings"
            onClick={() => setIsOpen(true)}
          />
        </div>
        <div className="rounded-b-2 border border-secondary-border border-t-0 p-10 bg-primary-bg">
          <h3 className="text-16 font-bold mb-4">Select pair</h3>
          <div className="flex gap-3 mb-5">
            <SelectButton
              variant="rounded-secondary"
              fullWidth
              onClick={() => {
                setCurrentlyPicking("tokenA");
                setIsOpenedTokenPick(true);
              }}
              size="large"
            >
              {tokenA ? (
                <span className="flex gap-2 items-center">
                  <Image
                    className="flex-shrink-0"
                    src={tokenA.logoURI}
                    alt="Ethereum"
                    width={32}
                    height={32}
                  />
                  <span className="block overflow-ellipsis whitespace-nowrap w-[141px] overflow-hidden text-left">
                    {tokenA.symbol}
                  </span>
                </span>
              ) : (
                <span>Select token</span>
              )}
            </SelectButton>
            <SelectButton
              variant="rounded-secondary"
              fullWidth
              onClick={() => {
                setCurrentlyPicking("tokenB");
                setIsOpenedTokenPick(true);
              }}
              size="large"
            >
              {tokenB ? (
                <span className="flex gap-2 items-center">
                  <Image
                    className="flex-shrink-0"
                    src={tokenB.logoURI}
                    alt="Ethereum"
                    width={32}
                    height={32}
                  />
                  <span className="block overflow-ellipsis whitespace-nowrap w-[141px] overflow-hidden text-left">
                    {tokenB.symbol}
                  </span>
                </span>
              ) : (
                <span>Select token</span>
              )}
            </SelectButton>
          </div>
          <FeeAmountSettings />
          <div className="mb-5" />
          <div className="grid gap-5 grid-cols-2">
            <div className="flex flex-col gap-5">
              {tokenA && <TokenDepositCard token={tokenA} />}
              {tokenB && <TokenDepositCard token={tokenB} />}
            </div>
            <div></div>
          </div>

          <div className="mb-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-16 font-bold">Set price range</h3>
              <div className="flex gap-3 items-center">
                {/*<InputButton text="Full range" isActive={false}/>*/}
                <button
                  onClick={() => setFullRange(!fullRange)}
                  className={clsx(
                    "text-12 h-7 rounded-1 min-w-[60px] px-4 border duration-200",
                    fullRange
                      ? "bg-active-bg border-green text-primary-text"
                      : "hover:bg-active-bg bg-primary-bg border-transparent text-secondary-text",
                  )}
                >
                  Full range
                </button>
                <div className="flex p-0.5 gap-0.5 rounded-1 bg-secondary-bg">
                  <button
                    onClick={() => setMainPriceToken("DAI")}
                    className={clsx(
                      "text-12 h-7 rounded-1 min-w-[60px] px-3 border duration-200",
                      mainPriceToken === "DAI"
                        ? "bg-active-bg border-green text-primary-text"
                        : "hover:bg-active-bg bg-primary-bg border-transparent text-secondary-text",
                    )}
                  >
                    DAI
                  </button>
                  <button
                    onClick={() => setMainPriceToken("ETH")}
                    className={clsx(
                      "text-12 h-7 rounded-1 min-w-[60px] px-3 border duration-200",
                      mainPriceToken === "ETH"
                        ? "bg-active-bg border-green text-primary-text"
                        : "hover:bg-active-bg bg-primary-bg border-transparent text-secondary-text",
                    )}
                  >
                    ETH
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <PriceRangeCard />
              <PriceRangeCard />
            </div>
          </div>

          <div className="flex justify-between items-end mb-5">
            <div className="flex flex-col gap-1">
              <span className="text-12 text-secondary-text">Low price</span>
              <input
                className="font-medium text-16 bg-transparent border-0 outline-0"
                type="text"
                value={906.56209}
              />
              <span className="text-12 text-secondary-text">DAI per ETH</span>
            </div>
            <div className="flex gap-3">
              <ZoomButton icon="zoom-in" />
              <ZoomButton icon="zoom-out" />
            </div>
          </div>

          <div className="mb-5">
            <svg
              width="520"
              height="226"
              viewBox="0 0 520 226"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line y1="201.5" x2="514" y2="201.5" stroke="#393939" />
              <path
                d="M0 177.157V202H520V198.32H205.18V179.458H520V174.857H446.623V177.157H333.705V174.857H225.836V173.477H216.197V12H212.525V155.075H207.934V157.375H205.18V151.855H186.82V157.375H169.836V173.477H158.82V177.157H126.689V174.857H112.918V176.237H80.3279V177.157H0Z"
                fill="#3BD171"
              />
              <rect opacity="0.4" x="203" width="2" height="202" fill="#F5FFF9" />
              <rect
                opacity="0.1"
                x="113"
                width="288"
                height="202"
                fill="url(#paint0_linear_1983_51043)"
              />
              <rect x="401" width="4" height="202" fill="#108E3D" />
              <path
                d="M401 0H421C423.209 0 425 1.79086 425 4V44C425 46.2091 423.209 48 421 48H401V0Z"
                fill="#108E3D"
              />
              <rect x="409" y="12" width="2" height="24" fill="#F5FFF9" />
              <rect x="415" y="12" width="2" height="24" fill="#F5FFF9" />
              <rect width="4" height="202" transform="matrix(-1 0 0 1 113 0)" fill="#9576EC" />
              <path
                d="M113 0H93C90.7909 0 89 1.79086 89 4V44C89 46.2091 90.7909 48 93 48H113V0Z"
                fill="#9576EC"
              />
              <rect width="2" height="24" transform="matrix(-1 0 0 1 105 12)" fill="#F5FFF9" />
              <rect width="2" height="24" transform="matrix(-1 0 0 1 99 12)" fill="#F5FFF9" />
              <path
                d="M3.72 223.12C3.312 223.12 2.928 223.052 2.568 222.916C2.208 222.772 1.888 222.536 1.608 222.208C1.328 221.88 1.108 221.44 0.948 220.888C0.796 220.328 0.72 219.632 0.72 218.8V218.56C0.72 217.784 0.796 217.136 0.948 216.616C1.108 216.088 1.328 215.668 1.608 215.356C1.888 215.044 2.208 214.82 2.568 214.684C2.928 214.548 3.312 214.48 3.72 214.48C4.128 214.48 4.512 214.548 4.872 214.684C5.232 214.82 5.552 215.044 5.832 215.356C6.112 215.668 6.328 216.088 6.48 216.616C6.64 217.136 6.72 217.784 6.72 218.56V218.8C6.72 219.632 6.64 220.328 6.48 220.888C6.328 221.44 6.112 221.88 5.832 222.208C5.552 222.536 5.232 222.772 4.872 222.916C4.512 223.052 4.128 223.12 3.72 223.12ZM3.72 222.136C3.976 222.136 4.216 222.092 4.44 222.004C4.664 221.908 4.86 221.74 5.028 221.5C5.204 221.252 5.34 220.912 5.436 220.48C5.54 220.04 5.592 219.48 5.592 218.8V218.56C5.592 217.728 5.504 217.088 5.328 216.64C5.16 216.192 4.932 215.884 4.644 215.716C4.364 215.548 4.056 215.464 3.72 215.464C3.384 215.464 3.072 215.548 2.784 215.716C2.504 215.884 2.276 216.192 2.1 216.64C1.932 217.088 1.848 217.728 1.848 218.56V218.8C1.848 219.48 1.896 220.04 1.992 220.48C2.096 220.912 2.232 221.252 2.4 221.5C2.576 221.74 2.776 221.908 3 222.004C3.232 222.092 3.472 222.136 3.72 222.136Z"
                fill="#B2B2B2"
              />
              <path
                d="M105.66 223V222.016H107.664V215.836L105.66 217.264V216.04L107.688 214.6H108.816V222.016H110.46V223H105.66ZM111.484 224.8L111.964 223V221.68H113.284V223L112.084 224.8H111.484ZM118.142 223.12C117.734 223.12 117.35 223.052 116.99 222.916C116.63 222.772 116.31 222.536 116.03 222.208C115.75 221.88 115.53 221.44 115.37 220.888C115.218 220.328 115.142 219.632 115.142 218.8V218.56C115.142 217.784 115.218 217.136 115.37 216.616C115.53 216.088 115.75 215.668 116.03 215.356C116.31 215.044 116.63 214.82 116.99 214.684C117.35 214.548 117.734 214.48 118.142 214.48C118.55 214.48 118.934 214.548 119.294 214.684C119.654 214.82 119.974 215.044 120.254 215.356C120.534 215.668 120.75 216.088 120.902 216.616C121.062 217.136 121.142 217.784 121.142 218.56V218.8C121.142 219.632 121.062 220.328 120.902 220.888C120.75 221.44 120.534 221.88 120.254 222.208C119.974 222.536 119.654 222.772 119.294 222.916C118.934 223.052 118.55 223.12 118.142 223.12ZM118.142 222.136C118.398 222.136 118.638 222.092 118.862 222.004C119.086 221.908 119.282 221.74 119.45 221.5C119.626 221.252 119.762 220.912 119.858 220.48C119.962 220.04 120.014 219.48 120.014 218.8V218.56C120.014 217.728 119.926 217.088 119.75 216.64C119.582 216.192 119.354 215.884 119.066 215.716C118.786 215.548 118.478 215.464 118.142 215.464C117.806 215.464 117.494 215.548 117.206 215.716C116.926 215.884 116.698 216.192 116.522 216.64C116.354 217.088 116.27 217.728 116.27 218.56V218.8C116.27 219.48 116.318 220.04 116.414 220.48C116.518 220.912 116.654 221.252 116.822 221.5C116.998 221.74 117.198 221.908 117.422 222.004C117.654 222.092 117.894 222.136 118.142 222.136ZM125.583 223.12C125.175 223.12 124.791 223.052 124.431 222.916C124.071 222.772 123.751 222.536 123.471 222.208C123.191 221.88 122.971 221.44 122.811 220.888C122.659 220.328 122.583 219.632 122.583 218.8V218.56C122.583 217.784 122.659 217.136 122.811 216.616C122.971 216.088 123.191 215.668 123.471 215.356C123.751 215.044 124.071 214.82 124.431 214.684C124.791 214.548 125.175 214.48 125.583 214.48C125.991 214.48 126.375 214.548 126.735 214.684C127.095 214.82 127.415 215.044 127.695 215.356C127.975 215.668 128.191 216.088 128.343 216.616C128.503 217.136 128.583 217.784 128.583 218.56V218.8C128.583 219.632 128.503 220.328 128.343 220.888C128.191 221.44 127.975 221.88 127.695 222.208C127.415 222.536 127.095 222.772 126.735 222.916C126.375 223.052 125.991 223.12 125.583 223.12ZM125.583 222.136C125.839 222.136 126.079 222.092 126.303 222.004C126.527 221.908 126.723 221.74 126.891 221.5C127.067 221.252 127.203 220.912 127.299 220.48C127.403 220.04 127.455 219.48 127.455 218.8V218.56C127.455 217.728 127.367 217.088 127.191 216.64C127.023 216.192 126.795 215.884 126.507 215.716C126.227 215.548 125.919 215.464 125.583 215.464C125.247 215.464 124.935 215.548 124.647 215.716C124.367 215.884 124.139 216.192 123.963 216.64C123.795 217.088 123.711 217.728 123.711 218.56V218.8C123.711 219.48 123.759 220.04 123.855 220.48C123.959 220.912 124.095 221.252 124.263 221.5C124.439 221.74 124.639 221.908 124.863 222.004C125.095 222.092 125.335 222.136 125.583 222.136ZM133.025 223.12C132.617 223.12 132.233 223.052 131.873 222.916C131.513 222.772 131.193 222.536 130.913 222.208C130.633 221.88 130.413 221.44 130.253 220.888C130.101 220.328 130.025 219.632 130.025 218.8V218.56C130.025 217.784 130.101 217.136 130.253 216.616C130.413 216.088 130.633 215.668 130.913 215.356C131.193 215.044 131.513 214.82 131.873 214.684C132.233 214.548 132.617 214.48 133.025 214.48C133.433 214.48 133.817 214.548 134.177 214.684C134.537 214.82 134.857 215.044 135.137 215.356C135.417 215.668 135.633 216.088 135.785 216.616C135.945 217.136 136.025 217.784 136.025 218.56V218.8C136.025 219.632 135.945 220.328 135.785 220.888C135.633 221.44 135.417 221.88 135.137 222.208C134.857 222.536 134.537 222.772 134.177 222.916C133.817 223.052 133.433 223.12 133.025 223.12ZM133.025 222.136C133.281 222.136 133.521 222.092 133.745 222.004C133.969 221.908 134.165 221.74 134.333 221.5C134.509 221.252 134.645 220.912 134.741 220.48C134.845 220.04 134.897 219.48 134.897 218.8V218.56C134.897 217.728 134.809 217.088 134.633 216.64C134.465 216.192 134.237 215.884 133.949 215.716C133.669 215.548 133.361 215.464 133.025 215.464C132.689 215.464 132.377 215.548 132.089 215.716C131.809 215.884 131.581 216.192 131.405 216.64C131.237 217.088 131.153 217.728 131.153 218.56V218.8C131.153 219.48 131.201 220.04 131.297 220.48C131.401 220.912 131.537 221.252 131.705 221.5C131.881 221.74 132.081 221.908 132.305 222.004C132.537 222.092 132.777 222.136 133.025 222.136Z"
                fill="#B2B2B2"
              />
              <path
                d="M210.48 223V222.076L213.84 219.16C214.184 218.872 214.448 218.62 214.632 218.404C214.816 218.18 214.94 217.968 215.004 217.768C215.076 217.568 215.112 217.352 215.112 217.12C215.112 216.648 214.972 216.26 214.692 215.956C214.412 215.644 214.028 215.488 213.54 215.488C212.956 215.488 212.508 215.648 212.196 215.968C211.884 216.28 211.728 216.724 211.728 217.3H210.6C210.6 216.748 210.72 216.26 210.96 215.836C211.208 215.412 211.552 215.08 211.992 214.84C212.44 214.6 212.956 214.48 213.54 214.48C214.108 214.48 214.592 214.596 214.992 214.828C215.4 215.052 215.708 215.364 215.916 215.764C216.132 216.156 216.24 216.608 216.24 217.12C216.24 217.504 216.164 217.856 216.012 218.176C215.86 218.488 215.648 218.784 215.376 219.064C215.112 219.344 214.804 219.636 214.452 219.94L211.944 222.016H216.36V223H210.48ZM217.621 224.8L218.101 223V221.68H219.421V223L218.221 224.8H217.621ZM224.279 223.12C223.871 223.12 223.487 223.052 223.127 222.916C222.767 222.772 222.447 222.536 222.167 222.208C221.887 221.88 221.667 221.44 221.507 220.888C221.355 220.328 221.279 219.632 221.279 218.8V218.56C221.279 217.784 221.355 217.136 221.507 216.616C221.667 216.088 221.887 215.668 222.167 215.356C222.447 215.044 222.767 214.82 223.127 214.684C223.487 214.548 223.871 214.48 224.279 214.48C224.687 214.48 225.071 214.548 225.431 214.684C225.791 214.82 226.111 215.044 226.391 215.356C226.671 215.668 226.887 216.088 227.039 216.616C227.199 217.136 227.279 217.784 227.279 218.56V218.8C227.279 219.632 227.199 220.328 227.039 220.888C226.887 221.44 226.671 221.88 226.391 222.208C226.111 222.536 225.791 222.772 225.431 222.916C225.071 223.052 224.687 223.12 224.279 223.12ZM224.279 222.136C224.535 222.136 224.775 222.092 224.999 222.004C225.223 221.908 225.419 221.74 225.587 221.5C225.763 221.252 225.899 220.912 225.995 220.48C226.099 220.04 226.151 219.48 226.151 218.8V218.56C226.151 217.728 226.063 217.088 225.887 216.64C225.719 216.192 225.491 215.884 225.203 215.716C224.923 215.548 224.615 215.464 224.279 215.464C223.943 215.464 223.631 215.548 223.343 215.716C223.063 215.884 222.835 216.192 222.659 216.64C222.491 217.088 222.407 217.728 222.407 218.56V218.8C222.407 219.48 222.455 220.04 222.551 220.48C222.655 220.912 222.791 221.252 222.959 221.5C223.135 221.74 223.335 221.908 223.559 222.004C223.791 222.092 224.031 222.136 224.279 222.136ZM231.72 223.12C231.312 223.12 230.928 223.052 230.568 222.916C230.208 222.772 229.888 222.536 229.608 222.208C229.328 221.88 229.108 221.44 228.948 220.888C228.796 220.328 228.72 219.632 228.72 218.8V218.56C228.72 217.784 228.796 217.136 228.948 216.616C229.108 216.088 229.328 215.668 229.608 215.356C229.888 215.044 230.208 214.82 230.568 214.684C230.928 214.548 231.312 214.48 231.72 214.48C232.128 214.48 232.512 214.548 232.872 214.684C233.232 214.82 233.552 215.044 233.832 215.356C234.112 215.668 234.328 216.088 234.48 216.616C234.64 217.136 234.72 217.784 234.72 218.56V218.8C234.72 219.632 234.64 220.328 234.48 220.888C234.328 221.44 234.112 221.88 233.832 222.208C233.552 222.536 233.232 222.772 232.872 222.916C232.512 223.052 232.128 223.12 231.72 223.12ZM231.72 222.136C231.976 222.136 232.216 222.092 232.44 222.004C232.664 221.908 232.86 221.74 233.028 221.5C233.204 221.252 233.34 220.912 233.436 220.48C233.54 220.04 233.592 219.48 233.592 218.8V218.56C233.592 217.728 233.504 217.088 233.328 216.64C233.16 216.192 232.932 215.884 232.644 215.716C232.364 215.548 232.056 215.464 231.72 215.464C231.384 215.464 231.072 215.548 230.784 215.716C230.504 215.884 230.276 216.192 230.1 216.64C229.932 217.088 229.848 217.728 229.848 218.56V218.8C229.848 219.48 229.896 220.04 229.992 220.48C230.096 220.912 230.232 221.252 230.4 221.5C230.576 221.74 230.776 221.908 231 222.004C231.232 222.092 231.472 222.136 231.72 222.136ZM239.161 223.12C238.753 223.12 238.369 223.052 238.009 222.916C237.649 222.772 237.329 222.536 237.049 222.208C236.769 221.88 236.549 221.44 236.389 220.888C236.237 220.328 236.161 219.632 236.161 218.8V218.56C236.161 217.784 236.237 217.136 236.389 216.616C236.549 216.088 236.769 215.668 237.049 215.356C237.329 215.044 237.649 214.82 238.009 214.684C238.369 214.548 238.753 214.48 239.161 214.48C239.569 214.48 239.953 214.548 240.313 214.684C240.673 214.82 240.993 215.044 241.273 215.356C241.553 215.668 241.769 216.088 241.921 216.616C242.081 217.136 242.161 217.784 242.161 218.56V218.8C242.161 219.632 242.081 220.328 241.921 220.888C241.769 221.44 241.553 221.88 241.273 222.208C240.993 222.536 240.673 222.772 240.313 222.916C239.953 223.052 239.569 223.12 239.161 223.12ZM239.161 222.136C239.417 222.136 239.657 222.092 239.881 222.004C240.105 221.908 240.301 221.74 240.469 221.5C240.645 221.252 240.781 220.912 240.877 220.48C240.981 220.04 241.033 219.48 241.033 218.8V218.56C241.033 217.728 240.945 217.088 240.769 216.64C240.601 216.192 240.373 215.884 240.085 215.716C239.805 215.548 239.497 215.464 239.161 215.464C238.825 215.464 238.513 215.548 238.225 215.716C237.945 215.884 237.717 216.192 237.541 216.64C237.373 217.088 237.289 217.728 237.289 218.56V218.8C237.289 219.48 237.337 220.04 237.433 220.48C237.537 220.912 237.673 221.252 237.841 221.5C238.017 221.74 238.217 221.908 238.441 222.004C238.673 222.092 238.913 222.136 239.161 222.136Z"
                fill="#B2B2B2"
              />
              <path
                d="M318.42 223.12C317.812 223.12 317.292 223.016 316.86 222.808C316.436 222.592 316.108 222.304 315.876 221.944C315.652 221.576 315.54 221.168 315.54 220.72H316.668C316.668 221.128 316.808 221.464 317.088 221.728C317.368 221.984 317.812 222.112 318.42 222.112C319.028 222.112 319.472 221.98 319.752 221.716C320.032 221.444 320.172 221.092 320.172 220.66C320.172 220.212 320.028 219.852 319.74 219.58C319.46 219.3 319.02 219.16 318.42 219.16H317.52V218.2H318.42C318.996 218.2 319.412 218.08 319.668 217.84C319.924 217.592 320.052 217.252 320.052 216.82C320.052 216.404 319.928 216.08 319.68 215.848C319.432 215.608 319.012 215.488 318.42 215.488C317.852 215.488 317.436 215.612 317.172 215.86C316.916 216.1 316.788 216.4 316.788 216.76H315.66C315.66 216.336 315.768 215.952 315.984 215.608C316.2 215.264 316.512 214.992 316.92 214.792C317.336 214.584 317.836 214.48 318.42 214.48C319.012 214.48 319.512 214.584 319.92 214.792C320.336 214.992 320.648 215.26 320.856 215.596C321.072 215.932 321.18 216.3 321.18 216.7C321.18 217.18 321.052 217.588 320.796 217.924C320.548 218.252 320.196 218.484 319.74 218.62C320.22 218.772 320.6 219.02 320.88 219.364C321.16 219.708 321.3 220.18 321.3 220.78C321.3 221.204 321.188 221.596 320.964 221.956C320.74 222.308 320.412 222.592 319.98 222.808C319.556 223.016 319.036 223.12 318.42 223.12ZM322.68 224.8L323.16 223V221.68H324.48V223L323.28 224.8H322.68ZM329.337 223.12C328.929 223.12 328.545 223.052 328.185 222.916C327.825 222.772 327.505 222.536 327.225 222.208C326.945 221.88 326.725 221.44 326.565 220.888C326.413 220.328 326.337 219.632 326.337 218.8V218.56C326.337 217.784 326.413 217.136 326.565 216.616C326.725 216.088 326.945 215.668 327.225 215.356C327.505 215.044 327.825 214.82 328.185 214.684C328.545 214.548 328.929 214.48 329.337 214.48C329.745 214.48 330.129 214.548 330.489 214.684C330.849 214.82 331.169 215.044 331.449 215.356C331.729 215.668 331.945 216.088 332.097 216.616C332.257 217.136 332.337 217.784 332.337 218.56V218.8C332.337 219.632 332.257 220.328 332.097 220.888C331.945 221.44 331.729 221.88 331.449 222.208C331.169 222.536 330.849 222.772 330.489 222.916C330.129 223.052 329.745 223.12 329.337 223.12ZM329.337 222.136C329.593 222.136 329.833 222.092 330.057 222.004C330.281 221.908 330.477 221.74 330.645 221.5C330.821 221.252 330.957 220.912 331.053 220.48C331.157 220.04 331.209 219.48 331.209 218.8V218.56C331.209 217.728 331.121 217.088 330.945 216.64C330.777 216.192 330.549 215.884 330.261 215.716C329.981 215.548 329.673 215.464 329.337 215.464C329.001 215.464 328.689 215.548 328.401 215.716C328.121 215.884 327.893 216.192 327.717 216.64C327.549 217.088 327.465 217.728 327.465 218.56V218.8C327.465 219.48 327.513 220.04 327.609 220.48C327.713 220.912 327.849 221.252 328.017 221.5C328.193 221.74 328.393 221.908 328.617 222.004C328.849 222.092 329.089 222.136 329.337 222.136ZM336.779 223.12C336.371 223.12 335.987 223.052 335.627 222.916C335.267 222.772 334.947 222.536 334.667 222.208C334.387 221.88 334.167 221.44 334.007 220.888C333.855 220.328 333.779 219.632 333.779 218.8V218.56C333.779 217.784 333.855 217.136 334.007 216.616C334.167 216.088 334.387 215.668 334.667 215.356C334.947 215.044 335.267 214.82 335.627 214.684C335.987 214.548 336.371 214.48 336.779 214.48C337.187 214.48 337.571 214.548 337.931 214.684C338.291 214.82 338.611 215.044 338.891 215.356C339.171 215.668 339.387 216.088 339.539 216.616C339.699 217.136 339.779 217.784 339.779 218.56V218.8C339.779 219.632 339.699 220.328 339.539 220.888C339.387 221.44 339.171 221.88 338.891 222.208C338.611 222.536 338.291 222.772 337.931 222.916C337.571 223.052 337.187 223.12 336.779 223.12ZM336.779 222.136C337.035 222.136 337.275 222.092 337.499 222.004C337.723 221.908 337.919 221.74 338.087 221.5C338.263 221.252 338.399 220.912 338.495 220.48C338.599 220.04 338.651 219.48 338.651 218.8V218.56C338.651 217.728 338.563 217.088 338.387 216.64C338.219 216.192 337.991 215.884 337.703 215.716C337.423 215.548 337.115 215.464 336.779 215.464C336.443 215.464 336.131 215.548 335.843 215.716C335.563 215.884 335.335 216.192 335.159 216.64C334.991 217.088 334.907 217.728 334.907 218.56V218.8C334.907 219.48 334.955 220.04 335.051 220.48C335.155 220.912 335.291 221.252 335.459 221.5C335.635 221.74 335.835 221.908 336.059 222.004C336.291 222.092 336.531 222.136 336.779 222.136ZM344.22 223.12C343.812 223.12 343.428 223.052 343.068 222.916C342.708 222.772 342.388 222.536 342.108 222.208C341.828 221.88 341.608 221.44 341.448 220.888C341.296 220.328 341.22 219.632 341.22 218.8V218.56C341.22 217.784 341.296 217.136 341.448 216.616C341.608 216.088 341.828 215.668 342.108 215.356C342.388 215.044 342.708 214.82 343.068 214.684C343.428 214.548 343.812 214.48 344.22 214.48C344.628 214.48 345.012 214.548 345.372 214.684C345.732 214.82 346.052 215.044 346.332 215.356C346.612 215.668 346.828 216.088 346.98 216.616C347.14 217.136 347.22 217.784 347.22 218.56V218.8C347.22 219.632 347.14 220.328 346.98 220.888C346.828 221.44 346.612 221.88 346.332 222.208C346.052 222.536 345.732 222.772 345.372 222.916C345.012 223.052 344.628 223.12 344.22 223.12ZM344.22 222.136C344.476 222.136 344.716 222.092 344.94 222.004C345.164 221.908 345.36 221.74 345.528 221.5C345.704 221.252 345.84 220.912 345.936 220.48C346.04 220.04 346.092 219.48 346.092 218.8V218.56C346.092 217.728 346.004 217.088 345.828 216.64C345.66 216.192 345.432 215.884 345.144 215.716C344.864 215.548 344.556 215.464 344.22 215.464C343.884 215.464 343.572 215.548 343.284 215.716C343.004 215.884 342.776 216.192 342.6 216.64C342.432 217.088 342.348 217.728 342.348 218.56V218.8C342.348 219.48 342.396 220.04 342.492 220.48C342.596 220.912 342.732 221.252 342.9 221.5C343.076 221.74 343.276 221.908 343.5 222.004C343.732 222.092 343.972 222.136 344.22 222.136Z"
                fill="#B2B2B2"
              />
              <path
                d="M424.512 223V220.972H420.24V220.108L424.392 214.6H425.64V219.988H426.72V220.972H425.64V223H424.512ZM421.44 219.988H424.512V215.92L421.44 219.988ZM427.984 224.8L428.464 223V221.68H429.784V223L428.584 224.8H427.984ZM434.642 223.12C434.234 223.12 433.85 223.052 433.49 222.916C433.13 222.772 432.81 222.536 432.53 222.208C432.25 221.88 432.03 221.44 431.87 220.888C431.718 220.328 431.642 219.632 431.642 218.8V218.56C431.642 217.784 431.718 217.136 431.87 216.616C432.03 216.088 432.25 215.668 432.53 215.356C432.81 215.044 433.13 214.82 433.49 214.684C433.85 214.548 434.234 214.48 434.642 214.48C435.05 214.48 435.434 214.548 435.794 214.684C436.154 214.82 436.474 215.044 436.754 215.356C437.034 215.668 437.25 216.088 437.402 216.616C437.562 217.136 437.642 217.784 437.642 218.56V218.8C437.642 219.632 437.562 220.328 437.402 220.888C437.25 221.44 437.034 221.88 436.754 222.208C436.474 222.536 436.154 222.772 435.794 222.916C435.434 223.052 435.05 223.12 434.642 223.12ZM434.642 222.136C434.898 222.136 435.138 222.092 435.362 222.004C435.586 221.908 435.782 221.74 435.95 221.5C436.126 221.252 436.262 220.912 436.358 220.48C436.462 220.04 436.514 219.48 436.514 218.8V218.56C436.514 217.728 436.426 217.088 436.25 216.64C436.082 216.192 435.854 215.884 435.566 215.716C435.286 215.548 434.978 215.464 434.642 215.464C434.306 215.464 433.994 215.548 433.706 215.716C433.426 215.884 433.198 216.192 433.022 216.64C432.854 217.088 432.77 217.728 432.77 218.56V218.8C432.77 219.48 432.818 220.04 432.914 220.48C433.018 220.912 433.154 221.252 433.322 221.5C433.498 221.74 433.698 221.908 433.922 222.004C434.154 222.092 434.394 222.136 434.642 222.136ZM442.083 223.12C441.675 223.12 441.291 223.052 440.931 222.916C440.571 222.772 440.251 222.536 439.971 222.208C439.691 221.88 439.471 221.44 439.311 220.888C439.159 220.328 439.083 219.632 439.083 218.8V218.56C439.083 217.784 439.159 217.136 439.311 216.616C439.471 216.088 439.691 215.668 439.971 215.356C440.251 215.044 440.571 214.82 440.931 214.684C441.291 214.548 441.675 214.48 442.083 214.48C442.491 214.48 442.875 214.548 443.235 214.684C443.595 214.82 443.915 215.044 444.195 215.356C444.475 215.668 444.691 216.088 444.843 216.616C445.003 217.136 445.083 217.784 445.083 218.56V218.8C445.083 219.632 445.003 220.328 444.843 220.888C444.691 221.44 444.475 221.88 444.195 222.208C443.915 222.536 443.595 222.772 443.235 222.916C442.875 223.052 442.491 223.12 442.083 223.12ZM442.083 222.136C442.339 222.136 442.579 222.092 442.803 222.004C443.027 221.908 443.223 221.74 443.391 221.5C443.567 221.252 443.703 220.912 443.799 220.48C443.903 220.04 443.955 219.48 443.955 218.8V218.56C443.955 217.728 443.867 217.088 443.691 216.64C443.523 216.192 443.295 215.884 443.007 215.716C442.727 215.548 442.419 215.464 442.083 215.464C441.747 215.464 441.435 215.548 441.147 215.716C440.867 215.884 440.639 216.192 440.463 216.64C440.295 217.088 440.211 217.728 440.211 218.56V218.8C440.211 219.48 440.259 220.04 440.355 220.48C440.459 220.912 440.595 221.252 440.763 221.5C440.939 221.74 441.139 221.908 441.363 222.004C441.595 222.092 441.835 222.136 442.083 222.136ZM449.525 223.12C449.117 223.12 448.733 223.052 448.373 222.916C448.013 222.772 447.693 222.536 447.413 222.208C447.133 221.88 446.913 221.44 446.753 220.888C446.601 220.328 446.525 219.632 446.525 218.8V218.56C446.525 217.784 446.601 217.136 446.753 216.616C446.913 216.088 447.133 215.668 447.413 215.356C447.693 215.044 448.013 214.82 448.373 214.684C448.733 214.548 449.117 214.48 449.525 214.48C449.933 214.48 450.317 214.548 450.677 214.684C451.037 214.82 451.357 215.044 451.637 215.356C451.917 215.668 452.133 216.088 452.285 216.616C452.445 217.136 452.525 217.784 452.525 218.56V218.8C452.525 219.632 452.445 220.328 452.285 220.888C452.133 221.44 451.917 221.88 451.637 222.208C451.357 222.536 451.037 222.772 450.677 222.916C450.317 223.052 449.933 223.12 449.525 223.12ZM449.525 222.136C449.781 222.136 450.021 222.092 450.245 222.004C450.469 221.908 450.665 221.74 450.833 221.5C451.009 221.252 451.145 220.912 451.241 220.48C451.345 220.04 451.397 219.48 451.397 218.8V218.56C451.397 217.728 451.309 217.088 451.133 216.64C450.965 216.192 450.737 215.884 450.449 215.716C450.169 215.548 449.861 215.464 449.525 215.464C449.189 215.464 448.877 215.548 448.589 215.716C448.309 215.884 448.081 216.192 447.905 216.64C447.737 217.088 447.653 217.728 447.653 218.56V218.8C447.653 219.48 447.701 220.04 447.797 220.48C447.901 220.912 448.037 221.252 448.205 221.5C448.381 221.74 448.581 221.908 448.805 222.004C449.037 222.092 449.277 222.136 449.525 222.136Z"
                fill="#B2B2B2"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_1983_51043"
                  x1="113"
                  y1="119"
                  x2="401"
                  y2="119"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#9576EC" />
                  <stop offset="1" stop-color="#108E3D" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="mb-5">
            <h3 className="text-16 font-bold mb-4">Deposit amounts</h3>
            <div className="grid grid-cols-2 gap-3">
              <DepositCard />
              <DepositCard />
            </div>
          </div>

          <div className="grid gap-2 mb-2 grid-cols-2">
            {!isAllowedA && (
              <Button variant="outline" fullWidth onClick={() => approveA()}>
                {isApprovingA ? "Loading..." : <span>Approve {tokenA?.symbol}</span>}
              </Button>
            )}
            {!isAllowedB && (
              <Button variant="outline" fullWidth onClick={() => approveB()}>
                {isApprovingB ? "Loading..." : <span>Approve {tokenB?.symbol}</span>}
              </Button>
            )}
          </div>

          <Button onClick={handleAddLiquidity} fullWidth>
            Add liquidity
          </Button>
        </div>
        <PickTokenDialog
          handlePick={handlePick}
          isOpen={isOpenedTokenPick}
          setIsOpen={setIsOpenedTokenPick}
        />
      </div>
    </Container>
  );
}
