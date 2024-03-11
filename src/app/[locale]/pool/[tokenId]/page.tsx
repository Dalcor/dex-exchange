"use client";

import clsx from "clsx";
import JSBI from "jsbi";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useReadContract } from "wagmi";

import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Svg from "@/components/atoms/Svg";
import PoolStatusLabel from "@/components/labels/PoolStatusLabel";
import TextLabel from "@/components/labels/TextLabel";
import TokensPair from "@/components/others/TokensPair";
import { NONFUNGIBLE_POSITION_MANAGER_ABI } from "@/config/abis/nonfungiblePositionManager";
import { FEE_AMOUNT_DETAIL } from "@/config/constants/liquidityFee";
import { WrappedToken } from "@/config/types/WrappedToken";
import { usePool } from "@/hooks/usePools";
import { useTokens } from "@/hooks/useTokenLists";
import { useRouter } from "@/navigation";
import { FeeAmount } from "@/sdk";
import { Position } from "@/sdk/entities/position";

function PoolLiquidityCard() {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Image src="/tokens/ETH.svg" alt="Ethereum" width={24} height={24} />
        ETH
      </div>
      <div className="flex items-center gap-1">
        <span>4.07</span>
        <span>(6%)</span>
      </div>
    </div>
  );
}

function RangePriceCard({
  minPrice,
  maxPrice,
  token0,
  token1,
}: {
  minPrice?: string;
  maxPrice?: string;
  token0: WrappedToken | undefined;
  token1: WrappedToken | undefined;
}) {
  return (
    <div className="border border-secondary-border">
      <div className="py-3 flex items-center justify-center flex-col bg-secondary-bg">
        <div className="text-14 text-secondary-text">{minPrice ? "Min" : "Max"} price</div>
        <div className="text-18">{minPrice ? minPrice : maxPrice}</div>
        <div className="text-14 text-secondary-text">
          {token0?.symbol} per {token1?.symbol}
        </div>
      </div>
      <div className="bg-tertiary-bg py-3 px-5 text-14 rounded-1">
        Your position will be 100% ETH at this price
      </div>
    </div>
  );
}

const nonFungiblePositionManagerAddress = "0x1238536071e1c677a632429e3655c799b22cda52";

export default function PoolPage({
  params,
}: {
  params: {
    tokenId: string;
  };
}) {
  const router = useRouter();

  const [values, setValues] = useState(["0", "0", "0", "0"]);

  const { data: position } = useReadContract({
    address: nonFungiblePositionManagerAddress,
    abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
    functionName: "positions",
    args: [BigInt(params.tokenId)!],
    query: {
      enabled: Boolean(params.tokenId),
    },
  });

  const positionParsed = useMemo(() => {
    if (!position || !params.tokenId) {
      return undefined;
    }

    const [
      nonce,
      operator,
      token0,
      token1,
      tier,
      tickLower,
      tickUpper,
      liquidity,
      feeGrowthInside0LastX128,
      feeGrowthInside1LastX128,
      tokensOwed0,
      tokensOwed1,
    ] = position;

    return {
      nonce,
      operator,
      token0,
      token1,
      tier: tier as FeeAmount,
      tickLower,
      tickUpper,
      liquidity,
      feeGrowthInside0LastX128,
      feeGrowthInside1LastX128,
      tokensOwed0,
      tokensOwed1,
      tokenId: params.tokenId,
    };
  }, [params.tokenId, position]);

  console.log("PARSED");
  console.log(positionParsed);

  const tokens = useTokens();

  const tokenA = useMemo(() => {
    return tokens.find((t) => t.address === positionParsed?.token0);
  }, [positionParsed?.token0, tokens]);

  const tokenB = useMemo(() => {
    return tokens.find((t) => t.address === positionParsed?.token1);
  }, [positionParsed?.token1, tokens]);

  const pool = usePool(tokenA, tokenB, positionParsed?.tier);

  console.log(pool);

  const positionC = useMemo(() => {
    if (pool[1] && positionParsed) {
      return new Position({
        pool: pool[1],
        tickLower: positionParsed.tickLower,
        tickUpper: positionParsed.tickUpper,
        liquidity: JSBI.BigInt(positionParsed.liquidity.toString()),
      });
    }
  }, [pool, positionParsed]);

  console.log("Position");
  console.log(positionC);
  // console.log(pool[1]);
  // console.log(position);

  useEffect(() => {
    if (positionC) {
      setValues([
        positionC.token0PriceLower.toSignificant(),
        positionC.token0PriceUpper.toSignificant(),
        positionC.token0PriceUpper.invert().toSignificant(),
        positionC.token0PriceLower.invert().toSignificant(),
      ]);
      // console.log(positionC.token0PriceLower.toSignificant());
      // console.log(positionC.token0PriceUpper.toSignificant());
    }
  }, [positionC]);

  const [showFirst, setShowFirst] = useState(true);

  return (
    <Container>
      <div className="w-[800px] mx-auto py-[80px]">
        <button
          onClick={() => router.push("/pools")}
          className="flex items-center gap-3 py-1.5 mb-5"
        >
          <Svg iconName="back" />
          Back to pools
        </button>

        <div className="w-full flex justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <TokensPair tokenA={tokenA} tokenB={tokenB} />
            {positionParsed && (
              <TextLabel text={`${FEE_AMOUNT_DETAIL[positionParsed.tier].label}%`} color="grey" />
            )}
            <PoolStatusLabel status="in-range" />
          </div>
          <div className="flex items-center gap-3">
            <Button size="small" onClick={() => router.push("/increase")}>
              Increase liquidity
            </Button>
            <Button size="small" onClick={() => router.push("/remove")} variant="outline">
              Remove liquidity
            </Button>
          </div>
        </div>
        <div className="border border-secondary-border rounded-2">
          <div className="px-10 pb-10 pt-8 border-b border-secondary-border grid grid-cols-2 gap-5">
            <div>
              <h3 className="text-14">Liquidity</h3>
              <p className="text-20 font-bold mb-3">$26.08</p>
              <div className="p-5 grid gap-3 border border-secondary-border rounded-1 bg-secondary-bg">
                <PoolLiquidityCard />
                <PoolLiquidityCard />
              </div>
            </div>
            <div>
              <h3 className="text-14">Unclaimed fees</h3>
              <p className="text-20 font-bold mb-3 text-green">$21.08</p>
              <div className="p-5 grid gap-3 border border-secondary-border rounded-1 bg-secondary-bg">
                <PoolLiquidityCard />
                <PoolLiquidityCard />
              </div>
            </div>
          </div>
          <div className="p-10">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span>Selected Range</span>
                <PoolStatusLabel status="in-range" />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setShowFirst(true)}
                  className={clsx(
                    "text-12 h-7 rounded-1 min-w-[60px] px-3 border duration-200",
                    showFirst
                      ? "bg-active-bg border-green text-primary-text"
                      : "hover:bg-active-bg bg-primary-bg border-transparent text-secondary-text",
                  )}
                >
                  {tokenA?.symbol}
                </button>
                <button
                  onClick={() => setShowFirst(false)}
                  className={clsx(
                    "text-12 h-7 rounded-1 min-w-[60px] px-3 border duration-200",
                    !showFirst
                      ? "bg-active-bg border-green text-primary-text"
                      : "hover:bg-active-bg bg-primary-bg border-transparent text-secondary-text",
                  )}
                >
                  {tokenB?.symbol}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_20px_1fr] mb-5">
              <RangePriceCard
                token0={tokenA}
                token1={tokenB}
                minPrice={showFirst ? values[0] : values[2]}
              />
              <div className="relative">
                <div className="bg-primary-bg border border-secondary-border w-12 h-12 rounded-1 text-placeholder-text absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <Svg iconName="double-arrow" />
                </div>
              </div>
              <RangePriceCard
                token0={tokenA}
                token1={tokenB}
                maxPrice={showFirst ? values[1] : values[3]}
              />
            </div>
            <div className="bg-secondary-bg flex items-center justify-center flex-col py-3 border rounded-1 border-secondary-border">
              <div className="text-14 text-secondary-text">Current price</div>
              <div className="text-18">0.0026439</div>
              <div className="text-14 text-secondary-text">ETH per UNI</div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}