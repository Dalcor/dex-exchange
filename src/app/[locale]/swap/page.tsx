"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Container from "@/components/atoms/Container";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import IconButton from "@/components/atoms/IconButton";
import SwapSettingsDialog from "@/components/dialogs/SwapSettingsDialog";
import NetworkFeeConfigDialog from "@/components/dialogs/NetworkFeeConfigDialog";
import Button from "@/components/atoms/Button";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import SelectButton from "@/components/atoms/SelectButton";
import Image from "next/image";
import TokenInput from "@/components/others/TokenInput";
import SystemIconButton from "@/components/buttons/SystemIconButton";
import TransactionSettingsDialog from "@/components/dialogs/SwapSettingsDialog";
import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import { useAccount, useBalance, useChainId } from "wagmi";

export default function SwapPage() {
  const t = useTranslations('Trade');

  const [isOpenedFee, setIsOpenedFee] = useState(false);
  const [isOpenedTokenPick, setIsOpenedTokenPick] = useState(false);

  const { setIsOpen } = useTransactionSettingsDialogStore();

  const chainId = useChainId();

  const {address} = useAccount();

  const balance = useBalance({
    chainId,
    address
  });

  return (<>
      <Container>
        <div className="py-[80px] flex justify-center">
          <div className="grid gap-5 w-[600px]">

            <div>
              <div className="flex justify-between rounded-t-1 bg-tertiary-bg border-secondary-border border py-2 px-5">
                <div className="flex items-center gap-2.5">
                  <Svg iconName="wallet" size={32}/>
                  Wallet balance:  {balance?.data?.formatted} ETH
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-green">
                    <Svg iconName="check" size={32}/>
                  </span>
                  <Tooltip text="Wallet balance tooltip"/>
                </div>
              </div>
              <div
                className="flex justify-between items-center bg-primary-bg rounded-b-1 text-secondary-text border-secondary-border border border-t-0 py-2 px-5">
                <div className="flex items-center gap-2.5">
                  <Svg iconName="borrow" size={32}/>
                  Borrowed balance: 0 ETH
                </div>
                <Tooltip text="Wallet balance tooltip"/>
              </div>
            </div>

            <div className="px-5 pt-2.5 pb-5 bg-primary-bg rounded-2 border border-secondary-border">
              <div className="flex justify-between items-center mb-2.5">
                <h3 className="font-bold text-20">Swap</h3>
                <SystemIconButton iconSize={32} iconName="settings" onClick={() => setIsOpen(true)}/>
              </div>
              <TokenInput setIsOpenedTokenPick={setIsOpenedTokenPick}/>
              <div className="relative h-3">
                <button
                  className="text-secondary-text w-[48px] h-[48px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-secondary-bg rounded-1 flex items-center justify-center border border-primary-border hover:bg-green duration-200 hover:text-global-bg hover:border-green">
                  <Svg iconName="swap"/>
                </button>
              </div>
              <TokenInput setIsOpenedTokenPick={setIsOpenedTokenPick}/>
              <div className="my-3 py-3 px-5 border border-primary-border flex justify-between">
                <div className="flex items-center gap-1">
                  <Tooltip text="Network fee"/>
                  Network fee
                </div>
                <div className="flex gap-1">
                  <span className="text-secondary-text">
                    <Svg iconName="gas"/>
                  </span>
                  <span className="mr-1">$1.95</span>
                  <button className="duration-200 text-green hover:text-green-hover"
                          onClick={() => setIsOpenedFee(true)}>EDIT
                  </button>
                  <NetworkFeeConfigDialog isOpen={isOpenedFee} setIsOpen={setIsOpenedFee}/>
                </div>
              </div>
              <Button fullWidth>Swap</Button>
            </div>
          </div>
        </div>
        <PickTokenDialog isOpen={isOpenedTokenPick} setIsOpen={setIsOpenedTokenPick}/>
      </Container>
    </>
  )
}
