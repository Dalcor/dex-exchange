"use client";

import { useState } from "react";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Svg from "@/components/atoms/Svg";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import Image from "next/image";
import { useAccount } from "wagmi";
import { useRouter } from "@/navigation";


function PoolPosition({ onClick }: { onClick: any }) {
  return <div role="button"
              className="px-5 py-4 border-t border-secondary-border hover:bg-secondary-bg duration-200 cursor-pointer"
              onClick={onClick}>
    <div className="justify-between flex items-center mb-2">
      <div className="flex items-center">
        <Image src="/tokens/ETH.svg" alt="Ethereum" width={32} height={32}/>
        <Image className="-ml-3.5" src="/tokens/ETH.svg" alt="Ethereum" width={32} height={32}/>

        <span className="font-bold ml-4 mr-2 block">UNI / ETH</span>
        <div className="px-3 bg-tertiary-bg rounded-5 text-secondary-text">
          1%
        </div>
      </div>
      <div className="bg-green-bg rounded-5 pl-2 pr-3 py-1 text-green flex items-center">
        <div className="w-6 h-6 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-green"/>
        </div>
        In range
      </div>
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
            <Button onClick={() => router.push("/add")}>New position</Button>
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
              <PoolPosition onClick={() => router.push("/pool")}/>
              <PoolPosition onClick={() => router.push("/pool")}/>
              <PoolPosition onClick={() => router.push("/pool")}/>
            </div>
          }
        </div>
    </div>
    <PickTokenDialog isOpen={isOpenedTokenPick} setIsOpen={setIsOpenedTokenPick}/>
  </Container>
}
