"use client";

import Image from "next/image";
import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";

import Container from "@/components/atoms/Container";
import LocaleSwitcher from "@/components/atoms/LocaleSwitcher";
import SelectButton from "@/components/atoms/SelectButton";
import Svg from "@/components/atoms/Svg";
import Button from "@/components/buttons/Button";
import AccountDialog from "@/components/dialogs/AccountDialog";
import ConnectWalletDialog from "@/components/dialogs/ConnectWalletDialog";
import Navigation from "@/components/others/Navigation";
import NetworkPicker from "@/components/others/NetworkPicker";
import TokenListsSettings from "@/components/others/TokenListsSettings";
import WalletOrConnectButton from "@/components/others/WalletOrConnectButton";
import { Link } from "@/navigation";

export default function Header() {
  const [isOpenedWallet, setOpenedWallet] = useState(false);
  const [isOpenedAccount, setIsOpenedAccount] = useState(false);
  return (
    <div className="border-b-primary-border border-b mb-3">
      <Container>
        <div className="py-3 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <Link href="/">
              <Image src="/logo-short.svg" alt="" width={34} height={40} />
            </Link>
            <Navigation />
          </div>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <TokenListsSettings />
            <NetworkPicker />

            <AccountDialog
              isOpen={isOpenedAccount}
              setIsOpen={setIsOpenedAccount}
              setOpenedWallet={setOpenedWallet}
            />
            <ConnectWalletDialog isOpen={isOpenedWallet} setIsOpen={setOpenedWallet} />
          </div>
        </div>
      </Container>
    </div>
  );
}
