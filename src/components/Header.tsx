"use client";

import Container from "@/components/atoms/Container";
import Navigation from "@/components/Navigation";
import Button from "@/components/atoms/Button";
import { useMemo, useState } from "react";
import Image from "next/image";
import SelectButton from "@/components/atoms/SelectButton";
import Svg from "@/components/atoms/Svg";
import Popover from "@/components/atoms/Popover";
import Switch from "@/components/atoms/Switch";
import LocaleSwitcher from "@/components/atoms/LocaleSwitcher";
import ConnectWalletDialog from "@/components/ConnectWalletDialog";
import { networks } from "@/config/networks";
import SelectOption from "@/components/atoms/SelectOption";
import { useAccount, useDisconnect } from "wagmi";
import Tooltip from "@/components/atoms/Tooltip";

export default function Header() {
  const { address, isConnected, connector } = useAccount();
  const {disconnect} = useDisconnect();

  const [currentNetworkId, setCurrentNetworkId] = useState(1);
  const currentNetwork = useMemo(() => {
    return networks.find(n => n.chainId === currentNetworkId);
  }, [currentNetworkId]);

  const [isOpened, setIsOpened] = useState(false);
  const [isOpened1, setIsOpened1] = useState(false);

  const [isOpenedWallet, setOpenedWallet] = useState(false);

  return <div className="border-b-primary-border border-b mb-3">
    <Container>
      <div className="py-3 flex justify-between items-center">
        <div className="flex items-center gap-5">
          <Image src="/logo-short.svg" alt="" width={34} height={40}/>
          <Navigation />
        </div>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Popover isOpened={isOpened1} setIsOpened={setIsOpened1} placement="bottom-start" buttonContent="Default token list">
            <div className="bg-block-fill border border-primary-border rounded-1">
              <div className="border-b-primary-border border-b px-5">
                <div className="flex justify-between py-4 gap-2 items-center border-b border-b-disabled-border">
                  <span className="text-green">Default token list</span>
                  <Switch checked={true} setChecked={null} />
                </div>
                <div className="flex justify-between py-4 gap-4 items-center border-b border-b-disabled-border">
                  Auto-listing contract 0x01214023dhj23dj23... (Tier 1)
                  <Switch checked={true} setChecked={null} />
                </div>
                <div className="flex justify-between py-4 gap-4 items-center border-b border-b-disabled-border">
                  Auto-listing contract 0xff124fabqwdadasas... (Tier 2)
                  <Switch checked={true} setChecked={null} />
                </div>
                <div className="flex justify-between py-4 gap-4 items-center border-b border-b-disabled-border">
                  Auto-listing contract 0x0021fdb23d... (Shitcoin tier)
                  <Switch checked={true} setChecked={null} />
                </div>
                <div className="flex justify-between py-4 gap-4 items-center">
                  DEX223 TokenLists API
                  <Switch checked={true} setChecked={null} />
                </div>
              </div>
              <div className="py-4 px-5 border-b-primary-border border-b">
                <div className="flex gap-2 mb-1 items-center">
                  <h3>Custom auto-listing contract</h3>
                  <Tooltip text="Helper text" />
                  <span className="text-red px-2 border border-red rounded-5 bg-red-bg">Risky</span>
                </div>
                <input
                  className="duration-200 hover:border-green focus:border-green focus:outline-0 py-3 pl-5 mb-[2px] placeholder:text-placeholder text-16 w-full bg-input-fill rounded-1 border border-primary-border"
                  type="text"
                  placeholder="Custom auto-listing contract"
                />
                <div className="text-font-secondary text-12">Enter the contract address to retrieve tokens</div>

              </div>
              <div className="py-4 px-5">
                <div className="flex gap-2 mb-1 items-center">
                  <h3>Custom TokenList, URL</h3>
                  <Tooltip text="Helper info text" />
                  <span className="text-red px-2 border border-red rounded-5 bg-red-bg">Risky</span>
                </div>
                <input
                  className="duration-200 hover:border-green focus:border-green focus:outline-0 py-3 pl-5 mb-[2px] placeholder:text-placeholder text-16 w-full bg-input-fill rounded-1 border border-primary-border"
                  type="text"
                  placeholder="Custom auto-listing contract"
                />
                <div className="text-font-secondary text-12">Enter the token list URL</div>

              </div>
            </div>
          </Popover>
          <Popover isOpened={isOpened} setIsOpened={setIsOpened} placement="bottom-start" buttonContent={
            <span className="flex items-center gap-2 min-w-[110px]">
              <Image src={`${currentNetwork?.logo}`} alt="Ethereum" width={24} height={24} />
              {currentNetwork?.name}
            </span>
          }>
            <div className="py-1 text-16 bg-block-fill border border-primary-border rounded-1 min-w-[280px]">
              <div className="border-b-primary-border pb-1 border-b">
                {networks.map(({ chainId, name, logo }) => {
                  return <SelectOption key={chainId} onClick={() => {
                    setCurrentNetworkId(chainId);
                    setIsOpened(false);
                  }} isActive={chainId === currentNetworkId}>
                    <Image src={logo} alt={name} width={24} height={24} />
                    {name}
                  </SelectOption>
                })}
              </div>
              <div className="pt-1">
                <div role="button" className="flex gap-2 items-center py-3 px-5 bg-block-fill hover:bg-table-fill duration-200">
                  <Svg iconName="add" />
                  Add custom node
                  <span className="text-red block ml-auto">Risky</span>
                </div>
              </div>


            </div>
          </Popover>
          {isConnected && address
            ? <SelectButton withArrow={false} onClick={() => disconnect()}>
              <span className="flex gap-2 items-center px-3">
                <Svg iconName="wallet" />
                {`${address.slice(0, 5)}...${address.slice(-3)}`}
              </span>
            </SelectButton>
            : <Button size="small" onClick={() => setOpenedWallet(true)}>Connect wallet</Button>
          }
          <ConnectWalletDialog isOpen={isOpenedWallet} setIsOpen={setOpenedWallet} />
        </div>
      </div>
    </Container>
  </div>
}
