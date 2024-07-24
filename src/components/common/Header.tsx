"use client";

import Image from "next/image";

import Container from "@/components/atoms/Container";
import LocaleSwitcher from "@/components/atoms/LocaleSwitcher";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import MobileMenu from "@/components/common/MobileMenu";
import Navigation from "@/components/common/Navigation";
import NetworkPicker from "@/components/common/NetworkPicker";
import TokenListsSettings from "@/components/common/TokenListsSettings";
import AccountDialog from "@/components/dialogs/AccountDialog";
import ConnectWalletDialog from "@/components/dialogs/ConnectWalletDialog";
import { useConnectWalletDialogStateStore } from "@/components/dialogs/stores/useConnectWalletStore";
import { Link, usePathname } from "@/navigation";

export default function Header() {
  const { isOpened: isOpenedWallet, setIsOpened: setOpenedWallet } =
    useConnectWalletDialogStateStore();
  const pathname = usePathname();

  return (
    <div>
      <header className="md:mb-3 xl:before:hidden before:h-[1px] before:bg-footer-border before:w-full before:absolute relative before:bottom-0 before:left-0">
        <Container className="pl-4 pr-1 md:px-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-5">
              <Link className="relative w-7 h-8 xl:w-[35px] xl:h-10" href="/">
                <Image src="/logo-short.svg" alt="" fill />
              </Link>
              <Navigation />
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <LocaleSwitcher />
              <div className="fixed w-[calc(50%-24px)] bottom-2 left-4 md:static md:w-auto md:bottom-unset z-[88] md:z-[21]">
                <TokenListsSettings />
              </div>
              <NetworkPicker />

              <div className="fixed w-[calc(50%-24px)] bottom-2 right-4 md:static md:w-auto md:bottom-unset z-[88] md:z-[21]">
                <AccountDialog />
              </div>
              <ConnectWalletDialog isOpen={isOpenedWallet} setIsOpen={setOpenedWallet} />

              <MobileMenu />
            </div>

            <div className="md:hidden grid grid-cols-2 fixed bottom-0 left-0 bg-secondary-bg z-[87] gap-2 w-full h-12" />
          </div>
        </Container>
      </header>
      {!pathname.includes("/lib") && (
        <div className="h-[64px] bg-test-tokens-gradient">
          <Container className="flex h-full items-center px-5">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                Get text tokens for free
                <Image src="/test-tokens.svg" alt="" width={92} height={48} />
              </div>
              <Link href="/lib">
                <Button colorScheme={ButtonColor.LIGHT_GREEN} size={ButtonSize.MEDIUM}>
                  Get free tokens
                </Button>
              </Link>
            </div>
          </Container>
        </div>
      )}
    </div>
  );
}
