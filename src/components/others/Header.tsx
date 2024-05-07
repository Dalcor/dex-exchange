"use client";

import Image from "next/image";
import { useState } from "react";

import Container from "@/components/atoms/Container";
import LocaleSwitcher from "@/components/atoms/LocaleSwitcher";
import AccountDialog from "@/components/dialogs/AccountDialog";
import ConnectWalletDialog from "@/components/dialogs/ConnectWalletDialog";
import MobileMenu from "@/components/others/MobileMenu";
import Navigation from "@/components/others/Navigation";
import NetworkPicker from "@/components/others/NetworkPicker";
import TokenListsSettings from "@/components/others/TokenListsSettings";
import { Link } from "@/navigation";

export default function Header() {
  const [isOpenedWallet, setOpenedWallet] = useState(false);
  const [isOpenedAccount, setIsOpenedAccount] = useState(false);
  return (
    <header className="md:mb-3 md:before:hidden before:h-[1px] before:bg-footer-border before:w-full before:absolute relative before:bottom-0 before:left-0">
      <Container className="pl-4 pr-1 md:px-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-5">
            <Link className="relative w-7 h-8 md:w-[35px] md:h-10" href="/">
              <Image src="/logo-short.svg" alt="" fill />
            </Link>
            <Navigation />
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <LocaleSwitcher />
            <TokenListsSettings />
            <NetworkPicker />

            <AccountDialog
              isOpen={isOpenedAccount}
              setIsOpen={setIsOpenedAccount}
              setOpenedWallet={setOpenedWallet}
            />
            <ConnectWalletDialog isOpen={isOpenedWallet} setIsOpen={setOpenedWallet} />

            <MobileMenu />
          </div>

          <div className="md:hidden grid grid-cols-2 fixed bottom-0 left-0 bg-secondary-bg z-[98] gap-2 w-full px-4 py-2">
            <TokenListsSettings isMobile={true} />
            <AccountDialog
              isOpen={isOpenedAccount}
              setIsOpen={setIsOpenedAccount}
              setOpenedWallet={setOpenedWallet}
              isMobile={true}
            />
          </div>
        </div>
      </Container>
    </header>
  );
}
