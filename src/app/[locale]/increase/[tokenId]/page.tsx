"use client";

import JSBI from "jsbi";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useReadContract } from "wagmi";

import { Bound } from "@/app/[locale]/add/[[...currency]]/components/PriceRange/LiquidityChartRangeInput/types";
import useAddLiquidity from "@/app/[locale]/add/[[...currency]]/hooks/useAddLiquidity";
import { useLiquidityTierStore } from "@/app/[locale]/add/[[...currency]]/hooks/useLiquidityTierStore";
import { useAddLiquidityTokensStore } from "@/app/[locale]/add/[[...currency]]/stores/useAddLiquidityTokensStore";
import { useLiquidityPriceRangeStore } from "@/app/[locale]/add/[[...currency]]/stores/useLiquidityPriceRangeStore";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Svg from "@/components/atoms/Svg";
import SystemIconButton from "@/components/buttons/SystemIconButton";
import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import PoolStatusLabel from "@/components/labels/PoolStatusLabel";
import TokensPair from "@/components/others/TokensPair";
import { NONFUNGIBLE_POSITION_MANAGER_ABI } from "@/config/abis/nonfungiblePositionManager";
import { nonFungiblePositionManagerAddress } from "@/config/contracts";
import { usePool } from "@/hooks/usePools";
import { usePositionFromTokenId } from "@/hooks/usePositions";
import { useTokens } from "@/hooks/useTokenLists";
import { useRouter } from "@/navigation";
import { FeeAmount } from "@/sdk";
import { Position } from "@/sdk/entities/position";

import DepositAmount from "../../add/[[...currency]]/components/DepositAmount";

function RangePriceCard() {
  return (
    <div className="border border-secondary-border">
      <div className="py-3 flex items-center justify-center flex-col bg-secondary-bg">
        <div className="text-14 text-secondary-text">Min price</div>
        <div className="text-18">0.002</div>
        <div className="text-14 text-secondary-text">ETH per UNI</div>
      </div>
      <div className="bg-tertiary-bg py-3 px-5 text-14 rounded-1">
        Your position will be 100% ETH at this price
      </div>
    </div>
  );
}

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

function DepositCard() {
  return (
    <div className="bg-secondary-bg border border-secondary-border rounded-1 p-5">
      <div className="flex items-center justify-between mb-1">
        <input
          className="font-medium text-16 bg-transparent border-0 outline-0 min-w-0"
          type="text"
          value={906.56209}
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
export default function IncreaseLiquidityPage({
  params,
}: {
  params: {
    tokenId: string;
  };
}) {
  const { setIsOpen } = useTransactionSettingsDialogStore();
  const { setTicks } = useLiquidityPriceRangeStore();

  const router = useRouter();

  const { handleAddLiquidity } = useAddLiquidity();

  const { position, loading } = usePositionFromTokenId(BigInt(params.tokenId));
  //
  const tokens = useTokens();

  const tokenA = useMemo(() => {
    return tokens.find((t) => t.address === position?.token0);
  }, [position?.token0, tokens]);

  const tokenB = useMemo(() => {
    return tokens.find((t) => t.address === position?.token1);
  }, [position?.token1, tokens]);
  //

  const { setBothTokens } = useAddLiquidityTokensStore();
  const { setTier } = useLiquidityTierStore();

  useEffect(() => {
    if (tokenA && tokenB && position) {
      setBothTokens({ tokenA, tokenB });
      setTier(position.tier);
      setTicks({
        [Bound.LOWER]: position.tickLower,
        [Bound.UPPER]: position.tickUpper,
      });
    }
  }, [tokenA, tokenB]);

  const pool = usePool(tokenA, tokenB, position?.tier);

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

  console.log(positionC);

  const values = useMemo(() => {
    if (positionC) {
      return [
        positionC.token0PriceLower.toSignificant(),
        positionC.token0PriceUpper.toSignificant(),
        positionC.token0PriceUpper.invert().toSignificant(),
        positionC.token0PriceLower.invert().toSignificant(),
      ];
    }
    return ["0", "0", "0", "0"];
  }, [positionC]);

  return (
    <Container>
      <div className="w-[600px] bg-primary-bg mx-auto my-[80px]">
        <div className="flex justify-between items-center rounded-t-2 border py-2.5 px-6 border-secondary-border">
          <SystemIconButton
            onClick={() => router.push("/pool")}
            size="large"
            iconName="back"
            iconSize={32}
          />
          <h2 className="text-20 font-bold">Increase Liquidity</h2>
          <SystemIconButton
            onClick={() => setIsOpen(true)}
            size="large"
            iconName="settings"
            iconSize={32}
          />
        </div>
        <div className="rounded-b-2 border border-secondary-border border-t-0 p-10 bg-primary-bg">
          <div className="flex items-center justify-between mb-5">
            <TokensPair tokenA={tokenA} tokenB={tokenB} />
            <PoolStatusLabel status="in-range" />
          </div>

          <div className="border border-secondary-border rounded-1 bg-secondary-bg mb-5">
            <div className="grid gap-3 px-5 py-3 border-b border-secondary-border">
              <PoolLiquidityCard />
              <PoolLiquidityCard />
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <span className="font-bold">Fee tier</span>
              <span>{position?.tier}%</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-3">
            <span className="bold text-secondary-text">Selected range</span>
            <div className="flex gap-1">
              <button>ETH</button>
              <button>DAI</button>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_20px_1fr] mb-5">
            <RangePriceCard />
            <div className="relative">
              <div className="bg-primary-bg border border-secondary-border w-12 h-12 rounded-1 text-placeholder-text absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <Svg iconName="double-arrow" />
              </div>
            </div>
            <RangePriceCard />
          </div>

          <div className="bg-secondary-bg flex items-center justify-center flex-col py-3 border rounded-1 border-secondary-border mb-5">
            <div className="text-14 text-secondary-text">Current price</div>
            <div className="text-18">0.0026439</div>
            <div className="text-14 text-secondary-text">ETH per UNI</div>
          </div>

          <div className="mb-5">
            <DepositAmount />
            {/*<h3 className="text-16 font-bold mb-4">Add more liquidity</h3>*/}
            {/*<div className="grid grid-cols-2 gap-3">*/}
            {/*  /!*<DepositCard />*!/*/}
            {/*  /!*<DepositCard />*!/*/}

            {/*  */}
            {/*</div>*/}
          </div>

          <Button
            onClick={() => {
              if (positionC) {
                handleAddLiquidity(positionC, true);
              }
            }}
            fullWidth
          >
            Add liquidity
          </Button>
        </div>
      </div>
    </Container>
  );
}
