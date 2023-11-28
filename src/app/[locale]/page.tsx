"use client";

import Container from "@/components/atoms/Container";
import { useTranslations } from "next-intl";
import IconButton from "@/components/atoms/IconButton";
import Svg from "@/components/atoms/Svg";
import SelectButton from "@/components/atoms/SelectButton";
import Tooltip from "@/components/atoms/Tooltip";
import Image from "next/image";
import Button from "@/components/atoms/Button";
import { useState } from "react";
import SwapSettingsDialog from "@/components/dialogs/SwapSettingsDialog";
import NetworkFeeConfigDialog from "@/components/dialogs/NetworkFeeConfigDialog";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";


function TokenInput({setIsOpenedTokenPick}: {setIsOpenedTokenPick: (isOpened: boolean) => void}) {
  return <div className="px-5 py-4 bg-input-fill rounded-1 border border-primary-border">
    <span className="text-14 block mb-2 text-font-secondary">You pay</span>
    <div className="flex items-center mb-2 justify-between">
      <input className="h-12 bg-transparent outline-0 border-0 text-32" placeholder="0" type="text"/>
      <SelectButton onClick={() => setIsOpenedTokenPick(true)} size="large">
                    <span className="flex gap-2 items-center">
                      <Image src="/tokens/ETH.svg" alt="Ethereum" width={32} height={32}/>
                      ETH
                     </span>
      </SelectButton>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-14 block mb-2 text-font-secondary">$3,220.40</span>
      <span className="text-14 block mb-2 text-font-secondary">Balance: 0 ETH</span>
    </div>
  </div>;
}

export default function Home() {
  const t = useTranslations('Trade');

  const [isOpenedSettings, setIsOpenedSettings] = useState(false);
  const [isOpenedFee, setIsOpenedFee] = useState(false);
  const [isOpenedTokenPick, setIsOpenedTokenPick] = useState(false);

  return (<>
      <Container>
        <div className="py-[80px] flex justify-center">
          <div className="grid gap-5 w-[600px]">
            <div>
              <div className="flex justify-between rounded-t-1 bg-table-fill border-disabled-border border py-2 px-5">
                <div className="flex items-center gap-2.5">
                  <Svg iconName="wallet" size={32}/>
                  Wallet balance: 0 ETH
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-green">
                    <Svg iconName="check" size={32}/>
                  </span>
                  <Tooltip text="Wallet balance tooltip"/>
                </div>
              </div>
              <div
                className="flex justify-between items-center bg-block-fill rounded-b-1 text-font-secondary border-disabled-border border border-t-0 py-2 px-5">
                <div className="flex items-center gap-2.5">
                  <Svg iconName="borrow" size={32}/>
                  Borrowed balance: 0 ETH
                </div>
                <Tooltip text="Wallet balance tooltip"/>
              </div>
            </div>

            <div className="px-5 pt-2.5 pb-5 bg-block-fill rounded-2 border border-disabled-border">
              <div className="flex justify-between items-center mb-2.5">
                <h3 className="font-bold text-20">Swap</h3>
                <IconButton onClick={() => setIsOpenedSettings(true)}>
                  <Svg size={32} iconName="settings"/>
                </IconButton>
                <SwapSettingsDialog isOpen={isOpenedSettings} setIsOpen={setIsOpenedSettings} />
              </div>
              <TokenInput setIsOpenedTokenPick={setIsOpenedTokenPick} />
              <div className="relative h-3">
                <button className="text-font-secondary w-[48px] h-[48px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-input-fill rounded-1 flex items-center justify-center border border-primary-border hover:bg-green duration-200 hover:text-primary-bg hover:border-green">
                  <Svg iconName="swap" />
                </button>
              </div>
              <TokenInput setIsOpenedTokenPick={setIsOpenedTokenPick} />
              <div className="my-3 py-3 px-5 border border-primary-border flex justify-between">
                <div className="flex items-center gap-1">
                  <Tooltip text="Network fee" />
                  Network fee
                </div>
                <div className="flex gap-1">
                  <span className="text-font-secondary">
                    <Svg iconName="gas" />
                  </span>
                  <span className="mr-1">$1.95</span>
                  <button className="duration-200 text-green hover:text-green-hover" onClick={() => setIsOpenedFee(true)}>EDIT</button>
                  <NetworkFeeConfigDialog isOpen={isOpenedFee} setIsOpen={setIsOpenedFee} />
                </div>
              </div>
              <Button fullWidth>Swap</Button>
            </div>
          </div>
        </div>
        <PickTokenDialog isOpen={isOpenedTokenPick} setIsOpen={setIsOpenedTokenPick} />
      </Container>
    </>
  )
}
