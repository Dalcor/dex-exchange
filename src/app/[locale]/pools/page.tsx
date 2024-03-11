"use client";

import { multicall } from "@wagmi/core";
import JSBI from "jsbi";
import { useEffect, useMemo, useState } from "react";
import { Address } from "viem";
import { useAccount, useReadContract } from "wagmi";

import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Svg from "@/components/atoms/Svg";
import PoolStatusLabel from "@/components/labels/PoolStatusLabel";
import TextLabel from "@/components/labels/TextLabel";
import TokensPair from "@/components/others/TokensPair";
import { NONFUNGIBLE_POSITION_MANAGER_ABI } from "@/config/abis/nonfungiblePositionManager";
import { FEE_AMOUNT_DETAIL } from "@/config/constants/liquidityFee";
import { config } from "@/config/wagmi/config";
import { IIFE } from "@/functions/iife";
import { usePool } from "@/hooks/usePools";
import { useTokens } from "@/hooks/useTokenLists";
import { useRouter } from "@/navigation";
import { FeeAmount } from "@/sdk";
import { Position } from "@/sdk/entities/position";

type PositionInfo = {
  nonce: bigint;
  operator: `0x${string}`;
  token0: `0x${string}`;
  token1: `0x${string}`;
  tier: FeeAmount;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  feeGrowthInside0LastX128: bigint;
  feeGrowthInside1LastX128: bigint;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
  tokenId: bigint | undefined;
};

function PoolPosition({
  onClick,
  inRange = false,
  closed = false,
  position,
}: {
  onClick: any;
  inRange?: boolean;
  closed?: boolean;
  position: PositionInfo;
}) {
  const [values, setValues] = useState(["0", "0", "0", "0"]);

  const tokens = useTokens();

  const tokenA = useMemo(() => {
    return tokens.find((t) => t.address === position.token0);
  }, [position.token0, tokens]);

  const tokenB = useMemo(() => {
    return tokens.find((t) => t.address === position.token1);
  }, [position.token1, tokens]);

  const pool = usePool(tokenA, tokenB, position.tier);

  const positionC = useMemo(() => {
    if (pool[1] && position) {
      return new Position({
        pool: pool[1],
        tickLower: position.tickLower,
        tickUpper: position.tickUpper,
        liquidity: JSBI.BigInt(position.liquidity.toString()),
      });
    }
  }, [pool, position]);

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

  // const test = useMemo(() => {
  //   if (pool[1]) {
  //     const test1 = SqrtPriceMath.getNextSqrtPriceFromInput(
  //       pool[1]?.sqrtRatioX96,
  //       JSBI.BigInt(position.liquidity.toString()),
  //       JSBI.BigInt(1),
  //       true,
  //     );
  //
  //     console.log("test1");
  //     console.log(test1.toString());
  //
  //     const test2 = SqrtPriceMath.getNextSqrtPriceFromOutput(
  //       pool[1]?.sqrtRatioX96,
  //       JSBI.BigInt(position.liquidity.toString()),
  //       JSBI.BigInt(1),
  //       false,
  //     );
  //
  //     console.log("test1");
  //     console.log(test1.toString());
  //     console.log(test2.toString());
  //
  //     return [test1, test2];
  //   }
  //
  //   return [JSBI.BigInt(0), JSBI.BigInt(0)];
  // }, [pool, position.liquidity]);

  return (
    <div
      role="button"
      className="px-5 py-4 border-t border-secondary-border hover:bg-secondary-bg duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="justify-between flex items-center mb-2">
        <div className="flex items-center gap-2">
          <TokensPair tokenA={tokenA} tokenB={tokenB} />
          <TextLabel color="grey" text={`${FEE_AMOUNT_DETAIL[position.tier].label}%`} />
        </div>
        <PoolStatusLabel status={closed ? "closed" : inRange ? "in-range" : "out-of-range"} />
      </div>
      <div className="flex gap-2 items-center">
        <span className="text-secondary-text">Min:</span> {values[0]} {tokenA?.symbol} per{" "}
        {tokenB?.symbol}
        <Svg iconName="double-arrow" />
        <span className="text-secondary-text">Max:</span> {values[1]} {tokenA?.symbol} per{" "}
        {tokenB?.symbol}
      </div>
    </div>
  );
}

const nonFungiblePositionManagerAddress = "0x1238536071e1c677a632429e3655c799b22cda52";

export default function PoolsPage() {
  const { isConnected } = useAccount();
  const { address: account } = useAccount();
  const router = useRouter();

  const { data: balance } = useReadContract({
    address: nonFungiblePositionManagerAddress,
    abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
    functionName: "balanceOf",
    args: [account!],
    query: {
      enabled: Boolean(account),
    },
  });
  console.log("balance");

  console.log(balance);

  //4n

  const tokenIdsArgs = useMemo(() => {
    if (balance && account) {
      const tokenRequests = [];
      for (let i = 0; i < Number(balance); i++) {
        tokenRequests.push([account, i]);
      }
      return tokenRequests;
    }
    return [];
  }, [account, balance]);

  console.log("TOKENIDARGS");
  console.log(tokenIdsArgs);

  const [uPositions, setUPositions] = useState([]);
  //1n => [[account, 0],[account, 1]]

  useEffect(() => {
    IIFE(async () => {
      if (tokenIdsArgs.length) {
        const contracts = tokenIdsArgs.map((tokenId) => ({
          abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
          functionName: "tokenOfOwnerByIndex",
          args: tokenId,
          address: nonFungiblePositionManagerAddress as Address,
        }));

        const results = await multicall(config, { contracts });

        console.log("RESULTS");
        console.log(results);

        const positionsContracts = results
          .filter((res) => res.status === "success")
          .map((result) => {
            return {
              address: nonFungiblePositionManagerAddress as Address,
              abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
              functionName: "positions",
              args: [result.result],
            };
          });

        const positionsResult = await multicall(config, { contracts: positionsContracts });

        console.log(positionsResult);

        const userPositions = positionsResult
          // .filter((pos) => pos.status === "success")
          .map((pos, i) => {
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
            ] = pos.result as any;
            return {
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
              tokenId: results[i].result,
            };
          });

        setUPositions(userPositions);
      }
    });
  }, [tokenIdsArgs]);

  return (
    <Container>
      <div className="py-[80px] flex justify-center">
        <div className="w-full">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-24">Pools</h1>
            <Button size="regular" onClick={() => router.push("/add")}>
              <span className="flex items-center gap-2">
                New position
                <Svg iconName="add" />
              </span>
            </Button>
          </div>
          {!isConnected ? (
            <div className="w-full">
              <div className="min-h-[340px] bg-primary-bg flex items-center justify-center w-full flex-col gap-4">
                <EmptyStateIcon iconName="wallet" />
                <p className="text-16 text-secondary-text">
                  Connect to a wallet to see your liquidity
                </p>
              </div>
            </div>
          ) : (
            <div className="border rounded-2 border-secondary-border bg-primary-bg w-full">
              <div className="flex justify-between px-5 py-3">
                <span>Your positions</span>
                <span className="text-green">Hide closed positions</span>
              </div>
              {uPositions.map((position) => {
                return (
                  <PoolPosition
                    position={position}
                    key={position.nonce}
                    inRange={true}
                    onClick={() => router.push(`/pool/${position.tokenId.toString()}`)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
