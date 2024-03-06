"use client";

import Image from "next/image";

import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Svg from "@/components/atoms/Svg";
import PoolStatusLabel from "@/components/labels/PoolStatusLabel";
import TextLabel from "@/components/labels/TextLabel";
import TokensPair from "@/components/others/TokensPair";
import { useRouter } from "@/navigation";

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

export default function PoolPage() {
  const router = useRouter();

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
            <TokensPair />
            <TextLabel text="1%" color="grey" />
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
