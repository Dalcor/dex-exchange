import Dialog from "@/components/atoms/Dialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import Svg from "@/components/atoms/Svg";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import Image from "next/image";
import { wallets } from "@/config/wallets";
import ButtonWithIcon from "@/components/atoms/ButtonWithIcon";
import Tabs from "@/components/tabs/Tabs";
import Tab from "@/components/tabs/Tab";
import React, { ButtonHTMLAttributes, PropsWithChildren, useMemo } from "react";
import { copyToClipboard } from "@/functions/copyToClipboard";
import clsx from "clsx";
import { MetaMaskConnector } from "@wagmi/connectors/metaMask";
import { KeystoreConnector } from "@/config/connectors/keystore/connector";
import { WalletConnectConnector } from "@wagmi/connectors/walletConnect";
import { LedgerConnector } from "@wagmi/connectors/ledger";

interface Props {
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void
}

function IconButton({ children, ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return <button className={
    clsx(
      "w-10 h-10 flex justify-center items-center p-0 duration-200 text-font-primary rounded-full bg-transparent hover:bg-white-hover border-0 outline-0 cursor-pointer"
    )} {...props}>
    {children}
  </button>
}

export default function AccountDialog({ isOpen, setIsOpen }: Props) {
  const { disconnect } = useDisconnect();
  const { address, connector } = useAccount();

  const { data } = useBalance({address});

  const connectorKey = useMemo(() => {
    if(connector instanceof MetaMaskConnector) {
      return "metamask";
    }

    if(connector instanceof KeystoreConnector) {
      return "keystore";
    }

    if(connector instanceof WalletConnectConnector) {
      return "wc";
    }

    if (connector instanceof LedgerConnector) {
      return "ledger"
    }

    return "unknown";

  }, [connector]);

  return <Dialog isOpen={isOpen} setIsOpen={setIsOpen}>
    <DialogHeader onClose={() => setIsOpen(false)} title="Account"/>
    <div className="pt-10 pl-10 pr-10 min-w-[600px]">
      <div className="relative bg-gradient-to-tr from-[#5937B7] from-45% to-100% to-[#9576EC] rounded-2">
        <div className="absolute right-0 top-0 bottom-0 bg-account-card-pattern opacity-50 bg-no-repeat bg-right w-full h-full"/>
        <div className="relative mb-5 p-5 grid gap-3 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 py-2 px-3 rounded-1 bg-block-fill">
                {address
                  ? <Image src={wallets[connectorKey].image} alt="" width={24} height={24}/>
                  : <Svg iconName="wallet" />
                }
                {address ? `${address.slice(0, 5)}...${address.slice(-3)}` : "Not connected"}
              </div>
              <IconButton onClick={() => copyToClipboard(address || "")}>
                <Svg iconName="copy"/>
              </IconButton>
              <IconButton>
                <Svg iconName="etherscan"/>
              </IconButton>
            </div>
            <div>
              <IconButton onClick={() => disconnect()}>
                <Svg iconName="logout"/>
              </IconButton>
            </div>
          </div>
          <div>
            <div className="text-16 text-font-secondary">Balance</div>
            <div className="text-20 text-font-primary font-bold">
              {data ? <span>{(+data.formatted).toLocaleString('en-US', {maximumFractionDigits: 6})} {data?.symbol}</span> : "0.00"}

            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <ButtonWithIcon text="Buy" icon="wallet"/>
            <ButtonWithIcon text="Receive" icon="arrow-bottom"/>
            <ButtonWithIcon text="Send" icon="to-top"/>
          </div>
        </div>
      </div>
      <Tabs>
        <Tab title="Assets">
          <div className="flex flex-col items-center justify-center min-h-[324px] gap-2">
            <Image src="/empty/empty-assets.svg" width={80} height={80} alt=""/>
            <span className="text-font-secondary">All assets will be displayed here.</span>
          </div>
        </Tab>
        <Tab title="History">
          <div className="flex flex-col items-center justify-center min-h-[324px] gap-2">
            <Image src="/empty/empty-history.svg" width={80} height={80} alt=""/>
            <span className="text-font-secondary">All transaction will be displayed here.</span>
          </div>
        </Tab>
      </Tabs>
    </div>
  </Dialog>
}
