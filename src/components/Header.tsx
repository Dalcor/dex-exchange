"use client";

import Container from "@/components/atoms/Container";
import Navigation from "@/components/Navigation";
import Button from "@/components/atoms/Button";
import { useState } from "react";
import Image from "next/image";
import SelectButton from "@/components/atoms/SelectButton";
import Svg from "@/components/atoms/Svg";
import LocaleSwitcher from "@/components/atoms/LocaleSwitcher";
import ConnectWalletDialog from "@/components/ConnectWalletDialog";
import { useAccount, useDisconnect } from "wagmi";
import { Link } from "@/navigation";
import TokenListsSettings from "@/components/TokenListsSettings";
import NetworkPicker from "@/components/NetworkPicker";
import WalletDialog from "@/components/WalletDialog";
import WalletOrConnectButton from "@/components/WalletOrConnectButton";

export default function Header() {

  const [isOpenedWallet, setOpenedWallet] = useState(false);
  const [isOpenedAccount, setIsOpenedAccount] = useState(false);
  return <div className="border-b-primary-border border-b mb-3">
    <Container>
      <div className="py-3 flex justify-between items-center">
        <div className="flex items-center gap-5">
          <Link href="/">
            <Image src="/logo-short.svg" alt="" width={34} height={40}/>
          </Link>
          <Navigation/>
        </div>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <TokenListsSettings />
          <NetworkPicker />
          <WalletOrConnectButton openWallet={setOpenedWallet} openAccount={setIsOpenedAccount} />
          <WalletDialog isOpen={isOpenedAccount} setIsOpen={setIsOpenedAccount} />
          <ConnectWalletDialog isOpen={isOpenedWallet} setIsOpen={setOpenedWallet}/>
        </div>
      </div>
    </Container>
  </div>
}
