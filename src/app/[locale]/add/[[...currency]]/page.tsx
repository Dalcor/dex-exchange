"use client";

import clsx from "clsx";
import Image from "next/image";
import { useLocale } from "next-intl";
import { ButtonHTMLAttributes, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Abi, Address, encodeFunctionData, parseUnits, toHex } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import { PoolState } from "@/app/[locale]/add/hooks/types";
import { useAddLiquidityTokensStore } from "@/app/[locale]/add/hooks/useAddLiquidityTokensStore";
import { useLiquidityTierStore } from "@/app/[locale]/add/hooks/useLiquidityTierStore";
import Button from "@/components/atoms/Button";
import Collapse from "@/components/atoms/Collapse";
import Container from "@/components/atoms/Container";
import SelectButton from "@/components/atoms/SelectButton";
import Svg from "@/components/atoms/Svg";
import SystemIconButton from "@/components/buttons/SystemIconButton";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import { NONFUNGIBLE_POSITION_MANAGER_ABI } from "@/config/abis/nonfungiblePositionManager";
import { WrappedToken } from "@/config/types/WrappedToken";
import useAllowance from "@/hooks/useAllowance";
import { usePool, usePools } from "@/hooks/usePools";
import { useTokens } from "@/hooks/useTokenLists";
import useTransactionDeadline from "@/hooks/useTransactionDeadline";
import { useRouter } from "@/navigation";
import { FeeAmount } from "@/sdk";
import { useTransactionSettingsStore } from "@/stores/useTransactionSettingsStore";

import { DepositAmount } from "./DepositAmount";
import { PriceRange } from "./PriceRange";

const nonFungiblePositionManagerAddress = "0x1238536071e1c677a632429e3655c799b22cda52";

interface RadioButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  feeAmount: FeeAmount;
}

const FEE_TIERS = [FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH];

const FEE_AMOUNT_DETAIL: Record<
  FeeAmount,
  {
    label: string;
    description: ReactNode;
  }
> = {
  [FeeAmount.LOWEST]: {
    label: "0.01",
    description: "Best for very stable pairs.",
  },
  [FeeAmount.LOW]: {
    label: "0.05",
    description: "Best for stable pairs.",
  },
  [FeeAmount.MEDIUM]: {
    label: "0.3",
    description: "Best for most pairs.",
  },
  [FeeAmount.HIGH]: {
    label: "1",
    description: "Best for exotic pairs.",
  },
};

function RadioButton({ feeAmount, active = false, ...props }: RadioButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        "flex justify-between items-center px-5 py-2 rounded-1 border cursor-pointer bg-secondary-bg hover:bg-tertiary-hover duration-200",
        active
          ? "bg-active-bg shadow-select border-green pointer-events-none"
          : "border-transparent",
      )}
    >
      <div className="flex items-center gap-2">
        <span>{FEE_AMOUNT_DETAIL[feeAmount].label}% fee tier</span>
        {/*<TextLabel text="1% select" color="grey"/>*/}
      </div>
      <span className={active ? "text-green" : ""}>{FEE_AMOUNT_DETAIL[feeAmount].description}</span>
    </button>
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
  const [isFeeOpened, setIsFeeOpened] = useState(false);
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
  console.log("PARAMS");
  console.log(currency?.[0]);
  console.log(currency?.[1]);
  console.log(currency?.[2]);

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

  const pool = usePool(tokenA, tokenB, FeeAmount.MEDIUM);

  console.log("POOL");
  console.log(pool);

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

  console.log(poolsByFeeTier);

  const { setIsOpen } = useTransactionSettingsDialogStore();

  const { tier, setTier } = useLiquidityTierStore();

  const lang = useLocale();

  const [currentlyPicking, setCurrentlyPicking] = useState<"tokenA" | "tokenB">("tokenA");

  const handlePick = useCallback(
    (token: WrappedToken) => {
      if (currentlyPicking === "tokenA") {
        setTokenA(token);
      }

      if (currentlyPicking === "tokenB") {
        setTokenB(token);
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
        console.log("FOUND");
        setTier(Number(currency[2]));
      }
    }
  }, [currency, setTier, setTokenA, setTokenB, tokens]);

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

    const initializeParams = {
      account: accountAddress,
      abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
      functionName: "createAndInitializePoolIfNecessary" as const,
      address: nonFungiblePositionManagerAddress as Address,
      args: [tokenA.address, tokenB.address, tier, 0],
    };

    try {
      // const estimatedGas = await publicClient.estimateContractGas(initializeParams as any);
      //
      // const { request } = await publicClient.simulateContract({
      //   ...(initializeParams as any),
      //   gas: estimatedGas + BigInt(30000),
      // });
      const hash = await walletClient.writeContract({
        account: accountAddress,
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        functionName: "createAndInitializePoolIfNecessary" as const,
        address: nonFungiblePositionManagerAddress as Address,
        args: [
          tokenB.address as Address,
          tokenA.address as Address,
          tier,
          BigInt("76000000000000000000"),
        ],
        gas: BigInt(10_000_000),
      });
      console.log("POOL INITIALIZES");
      console.log(hash);
    } catch (e) {
      console.log(e);
    }

    const data = encodeFunctionData({
      abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
      functionName: "mint",
      args: [
        {
          token0: tokenA.address as Address,
          token1: tokenB.address as Address,
          fee: tier,
          tickLower: 400000,
          tickUpper: 100000,
          amount0Desired: BigInt(1),
          amount1Desired: BigInt(1),
          amount0Min: BigInt(1),
          amount1Min: BigInt(1),
          recipient,
          deadline,
        },
      ],
    });

    const params = {
      account: accountAddress,
      abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
      functionName: "mint" as const,
      address: nonFungiblePositionManagerAddress as Address,
      args: [
        {
          token0: tokenA.address as Address,
          token1: tokenB.address as Address,
          fee: tier,
          tickLower: -1000,
          tickUpper: 1000,
          amount0Desired: parseUnits("1", tokenA.decimals),
          amount1Desired: parseUnits("1", tokenB.decimals),
          amount0Min: parseUnits("0.9", tokenA.decimals),
          amount1Min: parseUnits("0.9", tokenB.decimals),
          recipient,
          deadline: deadline,
        },
      ],
    };

    try {
      const estimatedGas = await publicClient.estimateContractGas(params as any);

      const { request } = await publicClient.simulateContract({
        ...(params as any),
        gas: estimatedGas + BigInt(30000),
      });
      const hash = await walletClient.writeContract(request);
      console.log(hash);
    } catch (e) {
      console.log(e);
    }
  }, [accountAddress, deadline, publicClient, tier, tokenA, tokenB, walletClient]);

  return (
    <Container>
      <div className="w-[600px] bg-primary-bg mx-auto my-[80px]">
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
                  <span className="block overflow-ellipsis whitespace-nowrap w-[141px] overflow-hidden">
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
                  <span className="block overflow-ellipsis whitespace-nowrap w-[141px] overflow-hidden">
                    {tokenB.symbol}
                  </span>
                </span>
              ) : (
                <span>Select token</span>
              )}
            </SelectButton>
          </div>
          <div className="rounded-1 py-[2px] px-5 mb-5 bg-tertiary-bg">
            <div className="flex justify-between items-center py-[18px]">
              <div className="flex items-center gap-2">
                <span className="font-bold">{FEE_AMOUNT_DETAIL[tier].label}% fee tier</span>
                {/*<TextLabel text="67% select" color="grey"/>*/}
              </div>
              <button
                onClick={() => setIsFeeOpened(!isFeeOpened)}
                className="flex items-center gap-1 group"
              >
                <span className="text-secondary-text group-hover:text-primary-text duration-200">
                  {isFeeOpened ? "Hide" : "Edit"}
                </span>
                <Svg
                  iconName="expand-arrow"
                  className={isFeeOpened ? "duration-200 -rotate-180" : "duration-200 "}
                />
              </button>
            </div>
            <Collapse open={isFeeOpened}>
              <div className="grid gap-2 pb-5">
                {FEE_TIERS.map((_feeAmount) => (
                  <RadioButton
                    feeAmount={_feeAmount}
                    key={_feeAmount}
                    active={tier === _feeAmount}
                    onClick={() => {
                      setTier(_feeAmount);
                      window.history.replaceState(
                        null,
                        "",
                        `/${lang}/add/${tokenA?.address}/${tokenB?.address}/${_feeAmount}`,
                      );
                    }}
                  />
                ))}
              </div>
            </Collapse>
          </div>
          <PriceRange />
          <DepositAmount />

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
