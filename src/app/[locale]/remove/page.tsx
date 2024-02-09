"use client";

import Container from "@/components/atoms/Container";
import IconButton from "@/components/atoms/IconButton";
import Svg from "@/components/atoms/Svg";
import { useRouter } from "@/navigation";
import Image from "next/image";
import Button from "@/components/atoms/Button";
import Switch from "@/components/atoms/Switch";
import { ChangeEvent, useState } from "react";

function RangePriceCard() {
  return <div className="border border-secondary-border">
    <div className="py-3 flex items-center justify-center flex-col bg-secondary-bg">
      <div className="text-14 text-secondary-text">Min price</div>
      <div className="text-18">0.002</div>
      <div className="text-14 text-secondary-text">ETH per UNI</div>
    </div>
    <div className="bg-tertiary-bg py-3 px-5 text-14 rounded-1">
      Your position will be 100% ETH at this price
    </div>
  </div>
}

function PoolLiquidityCard() {
  return <div className="flex justify-between items-center">
    <span className="text-secondary-text">Pooled MATIC:</span>
    <div className="flex items-center gap-1">
      <span>4.07</span>
      <span><Image src="/tokens/ETH.svg" alt="Ethereum" width={24} height={24}/></span>
    </div>
  </div>
}

function DepositCard() {
  return <div className="bg-secondary-bg border border-secondary-border rounded-1 p-5">
    <div className="flex items-center justify-between mb-1">
      <input className="font-medium text-16 bg-transparent border-0 outline-0 min-w-0" type="text" value={906.56209}/>
      <div className="pr-3 py-1 pl-1 bg-primary-bg rounded-5 flex items-center gap-2 flex-shrink-0">
        <Image src="/tokens/ETH.svg" alt="Ethereum" width={24} height={24}/>
        MATIC
      </div>
    </div>
    <div className="flex justify-between items-center text-12">
      <span>—</span>
      <span>Balance: 23.245 ETH</span>
    </div>
  </div>
}
export default function DecreaseLiquidityPage() {
  const router = useRouter();

  const [value, setValue] = useState(25);

  return <Container>
    <div className="w-[600px] bg-primary-bg mx-auto my-[80px]">
      <div className="flex justify-between items-center rounded-t-2 border py-2.5 px-6 border-secondary-border">
        <IconButton onClick={() => router.push("/pool")}>
          <Svg iconName="back"/>
        </IconButton>
        <h2 className="text-20 font-bold">Remove Liquidity</h2>
        <IconButton onClick={() => {
        }}>
          <Svg iconName="settings"/>
        </IconButton>
      </div>
      <div className="rounded-b-2 border border-secondary-border border-t-0 p-10 bg-primary-bg">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center">
              <Image src="/tokens/ETH.svg" alt="Ethereum" width={32} height={32}/>
              <Image className="-ml-3.5" src="/tokens/ETH.svg" alt="Ethereum" width={32} height={32}/>
            </div>
            <span className="font-bold block">UNI / ETH</span>
          </div>
          <div className="bg-green-bg rounded-5 pl-2 pr-3 py-1 text-green flex items-center">
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green"/>
            </div>
            In range
          </div>
        </div>


        <div className="mb-5 p5 bg-secondary-bg border border-secondary-border rounded-1 p-5">
          <h4 className="mb-2">Amount</h4>
          <div className="flex justify-between items-center">
            <span className="text-32">{value}%</span>
            <div className="flex gap-3">
              <button onClick={() => setValue(25)} className="text-12 py-2 w-12 border-primary-border border bg-primary-bg rounded-1">25%</button>
              <button onClick={() => setValue(50)} className="text-12 py-2 w-12 border-primary-border border bg-primary-bg rounded-1">50%</button>
              <button onClick={() => setValue(75)} className="text-12 py-2 w-12 border-primary-border border bg-primary-bg rounded-1">75%</button>
              <button onClick={() => setValue(100)} className="text-12 py-2 w-12 border-primary-border border bg-primary-bg rounded-1">MAX</button>
            </div>
          </div>

          <div className="relative h-6">
            <input value={value} max={100} min={1} onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(+e.target.value)} className="w-full accent-green absolute top-2 left-0 right-0 duration-200" type="range"/>
            <div className="pointer-events-none absolute bg-green h-2 rounded-1 left-0 top-2" style={{width: value === 1 ? 0 : `calc(${value}% - 2px)`}}></div>
          </div>

        </div>

        <div className="border border-secondary-border rounded-1 bg-secondary-bg mb-5 p-5">
          <div className="grid gap-3 pb-3">
            <PoolLiquidityCard />
            <PoolLiquidityCard />
          </div>
          <div className="border-b border-secondary-border" />
          <div className="grid gap-3 pt-3">
            <PoolLiquidityCard />
            <PoolLiquidityCard />
          </div>
        </div>
        <div className="mb-5 flex items-center justify-between">
          Collect as WMATIC
          <Switch checked={false} setChecked={null} />
        </div>
        <Button fullWidth>Remove liquidity</Button>
      </div>
    </div>
  </Container>
}
