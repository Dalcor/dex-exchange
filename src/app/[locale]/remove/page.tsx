"use client";

import Image from "next/image";
import { ChangeEvent, useState } from "react";

import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Switch from "@/components/atoms/Switch";
import InputButton from "@/components/buttons/InputButton";
import SystemIconButton from "@/components/buttons/SystemIconButton";
import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import PoolStatusLabel from "@/components/labels/PoolStatusLabel";
import TokensPair from "@/components/others/TokensPair";
import { useRouter } from "@/navigation";

function PoolLiquidityCard() {
  return (
    <div className="flex justify-between items-center">
      <span className="text-secondary-text">Pooled MATIC:</span>
      <div className="flex items-center gap-1">
        <span>4.07</span>
        <span>
          <Image src="/tokens/ETH.svg" alt="Ethereum" width={24} height={24} />
        </span>
      </div>
    </div>
  );
}
export default function DecreaseLiquidityPage() {
  const router = useRouter();

  const [value, setValue] = useState(25);

  const { setIsOpen } = useTransactionSettingsDialogStore();

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
          <h2 className="text-20 font-bold">Remove Liquidity</h2>
          <SystemIconButton
            onClick={() => setIsOpen(true)}
            size="large"
            iconName="settings"
            iconSize={32}
          />
        </div>
        <div className="rounded-b-2 border border-secondary-border border-t-0 p-10 bg-primary-bg">
          <div className="flex items-center justify-between mb-5">
            <TokensPair />
            <PoolStatusLabel status="in-range" />
          </div>

          <div className="mb-5 p5 bg-secondary-bg border border-secondary-border rounded-1 p-5">
            <h4 className="mb-2">Amount</h4>
            <div className="flex justify-between items-center">
              <span className="text-32">{value}%</span>
              <div className="flex gap-3">
                <InputButton
                  text={"25%"}
                  isActive={value === 25}
                  onClick={() => setValue(25)}
                  className="text-12 py-2 w-12 border-primary-border border bg-primary-bg rounded-1"
                />
                <InputButton
                  text={"50%"}
                  isActive={value === 50}
                  onClick={() => setValue(50)}
                  className="text-12 py-2 w-12 border-primary-border border bg-primary-bg rounded-1"
                />
                <InputButton
                  text={"75%"}
                  isActive={value === 75}
                  onClick={() => setValue(75)}
                  className="text-12 py-2 w-12 border-primary-border border bg-primary-bg rounded-1"
                />
                <InputButton
                  text={"MAX"}
                  isActive={value === 100}
                  onClick={() => setValue(100)}
                  className="text-12 py-2 w-12 border-primary-border border bg-primary-bg rounded-1"
                />
              </div>
            </div>

            <div className="relative h-6">
              <input
                value={value}
                max={100}
                min={1}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(+e.target.value)}
                className="w-full accent-green absolute top-2 left-0 right-0 duration-200"
                type="range"
              />
              <div
                className="pointer-events-none absolute bg-green h-2 rounded-1 left-0 top-2"
                style={{ width: value === 1 ? 0 : `calc(${value}% - 2px)` }}
              ></div>
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
  );
}
