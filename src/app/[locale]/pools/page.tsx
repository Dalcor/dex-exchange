"use client";

import { useState } from "react";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Svg from "@/components/atoms/Svg";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { useAccount } from "wagmi";
import { useRouter } from "@/navigation";
import PoolStatusLabel from "@/components/labels/PoolStatusLabel";
import TokensPair from "@/components/others/TokensPair";
import TextLabel from "@/components/labels/TextLabel";

function PoolPosition({ onClick, inRange = false, closed = false }: {
  onClick: any,
  inRange?: boolean,
  closed?: boolean
}) {
  return <div role="button"
              className="px-5 py-4 border-t border-secondary-border hover:bg-secondary-bg duration-200 cursor-pointer"
              onClick={onClick}>
    <div className="justify-between flex items-center mb-2">
      <div className="flex items-center gap-2">
        <TokensPair/>
        <TextLabel color="grey" text="1%"/>
      </div>
      <PoolStatusLabel status={closed ? "closed" : inRange ? "in-range" : "out-of-range"}/>
    </div>
    <div className="flex gap-2 items-center">
      <span className="text-secondary-text">Min:</span> 105.19 UNI per ETH
      <Svg iconName="double-arrow"/>
      <span className="text-secondary-text">Max:</span> 105.19 UNI per ETH
    </div>
  </div>
}

export default function PoolsPage() {
  const { isConnected } = useAccount();

  const [isOpenedTokenPick, setIsOpenedTokenPick] = useState(false);
  const router = useRouter();


  return <Container>
    <div className="py-[80px] flex justify-center">
      <div className="w-full">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-24">Pools</h1>
          <Button size="regular" onClick={() => router.push("/add")}>
              <span className="flex items-center gap-2">
              New position
              <Svg iconName="add"/>
              </span>
          </Button>
        </div>
        {!isConnected ?
          <div className="w-full">
            <div className="min-h-[340px] bg-primary-bg flex items-center justify-center w-full flex-col gap-4">
              <EmptyStateIcon iconName="wallet"/>
              <p className="text-16 text-secondary-text">Connect to a wallet to see your liquidity</p>
            </div>
          </div> :
          <div className="border rounded-2 border-secondary-border bg-primary-bg w-full">
            <div className="flex justify-between px-5 py-3">
              <span>Your positions</span>
              <span className="text-green">Hide closed positions</span>
            </div>
            <PoolPosition inRange={true} onClick={() => router.push("/pool")}/>
            <PoolPosition inRange={false} onClick={() => router.push("/pool")}/>
            <PoolPosition closed onClick={() => router.push("/pool")}/>
          </div>
        }
      </div>
    </div>
    <PickTokenDialog isOpen={isOpenedTokenPick} setIsOpen={setIsOpenedTokenPick}/>
  </Container>
}
