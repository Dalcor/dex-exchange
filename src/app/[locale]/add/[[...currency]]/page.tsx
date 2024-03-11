"use client";

import clsx from "clsx";
import JSBI from "jsbi";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Address, parseUnits } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import FeeAmountSettings from "@/app/[locale]/add/components/FeeAmountSettings";
import PriceRangeInput from "@/app/[locale]/add/components/PriceRangeInput";
import TokenDepositCard from "@/app/[locale]/add/components/TokenDepositCard";
import { PoolState } from "@/app/[locale]/add/hooks/types";
import useAddLiquidity from "@/app/[locale]/add/hooks/useAddLiquidity";
import { useAddLiquidityTokensStore } from "@/app/[locale]/add/hooks/useAddLiquidityTokensStore";
import { useLiquidityTierStore } from "@/app/[locale]/add/hooks/useLiquidityTierStore";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import SelectButton from "@/components/atoms/SelectButton";
import Switch from "@/components/atoms/Switch";
import Tooltip from "@/components/atoms/Tooltip";
import IncrementDecrementIconButton from "@/components/buttons/IncrementDecrementIconButton";
import SystemIconButton from "@/components/buttons/SystemIconButton";
import ZoomButton from "@/components/buttons/ZoomButton";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import { FEE_TIERS } from "@/config/constants/liquidityFee";
import { WrappedToken } from "@/config/types/WrappedToken";
import useAllowance from "@/hooks/useAllowance";
import { usePool, usePools } from "@/hooks/usePools";
import { useTokens } from "@/hooks/useTokenLists";
import { useRouter } from "@/navigation";
import { FeeAmount } from "@/sdk";

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

export default function AddPoolPage({
  params,
}: {
  params: {
    currency: [string, string, string];
  };
}) {
  const [isOpenedTokenPick, setIsOpenedTokenPick] = useState(false);
  const router = useRouter();

  const currency = params.currency;

  const { tokenA, tokenB, setTokenA, setTokenB } = useAddLiquidityTokensStore();

  const tokens = useTokens();

  // const { isLoading, isError, largestUsageFeeTier, distributions } = useFeeTierDistribution(tokenA, tokenB);
  //
  // const { currencyIdA, currencyIdB, feeAmount } = useCurrencyParams();
  //

  const { handleAddLiquidity } = useAddLiquidity();

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
              <div className="px-5 py-2 flex justify-between bg-tertiary-bg rounded-3">
                <div className="flex flex-col">
                  <div className="text-secondary-text flex items-center gap-1 text-14">
                    Gas price
                    <Tooltip iconSize={20} text="Tooltip text" />
                  </div>
                  <div>33.53 GWEI</div>
                </div>
                <div className="flex flex-col">
                  <div className="text-secondary-text text-14">Total fee</div>
                  <div>0.005 ETH</div>
                </div>
                <div className="flex flex-col">
                  <div className="text-secondary-text text-14">Transactions</div>
                  <div>2</div>
                </div>
                <div>
                  <Button size="x-small" variant="outline">
                    Details
                  </Button>
                </div>
              </div>
              {tokenB && <TokenDepositCard token={tokenB} />}
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-16 font-bold">Set price range</h3>
                    <div className="flex gap-3 items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-primary-text text-12">Full range</span>
                        <Switch checked={fullRange} setChecked={() => setFullRange(!fullRange)} />
                      </div>

                      <div className="flex p-0.5 gap-0.5 rounded-2 bg-secondary-bg">
                        <button
                          onClick={() => setMainPriceToken("DAI")}
                          className={clsx(
                            "text-12 h-7 rounded-2 min-w-[60px] px-3 border duration-200",
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
                            "text-12 h-7 rounded-2 min-w-[60px] px-3 border duration-200",
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
                </div>
                <PriceRangeInput />
                <PriceRangeInput />
              </div>
              <div className="bg-secondary-bg rounded-3 px-5 pt-5 pb-4">
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
                  <div className="flex gap-2">
                    <ZoomButton icon="zoom-in" />
                    <ZoomButton icon="zoom-out" />
                  </div>
                </div>
                Сhart Placeholder
              </div>
            </div>
          </div>

          <div className="grid gap-2 mb-5 grid-cols-2">
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
