import clsx from "clsx";
import { useState } from "react";

import Collapse from "@/components/atoms/Collapse";
import Drawer from "@/components/atoms/Drawer";
import LocaleSwitcher from "@/components/atoms/LocaleSwitcher";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import IconButton, { IconButtonSize } from "@/components/buttons/IconButton";
import { useFeedbackDialogStore } from "@/components/dialogs/stores/useFeedbackDialogStore";
import { IconName } from "@/config/types/IconName";
import { Link, usePathname } from "@/navigation";

export function MobileLink({
  href,
  iconName,
  title,
  handleClose,
  isActive,
}: {
  href: string;
  iconName: IconName;
  title: string;
  handleClose: () => void;
  isActive?: boolean;
}) {
  return (
    <Link
      onClick={handleClose}
      href={href}
      className={clsx(
        "flex items-center gap-2 py-3 px-4 hover:text-green duration-200",
        isActive && "bg-navigation-active-mobile text-green pointer-events-none",
      )}
    >
      <Svg iconName={iconName} />
      {title}
    </Link>
  );
}

const mobileLinks: {
  href: string;
  iconName: IconName;
  title: string;
}[] = [
  {
    href: "/swap",
    iconName: "swap",
    title: "Swap",
  },
  {
    href: "/margin-trading",
    iconName: "margin-trading",
    title: "Margin trading",
  },
  {
    href: "/pools",
    iconName: "pools",
    title: "Pools",
  },
  {
    href: "/borrow",
    iconName: "borrow",
    title: "Borrow/Lend",
  },
  {
    href: "/portfolio",
    iconName: "portfolio",
    title: "Portfolio",
  },
  {
    href: "#",
    iconName: "token",
    title: "Token",
  },
];
export default function MobileMenu() {
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const [moreOpened, setMoreOpened] = useState(false);
  const pathname = usePathname();
  const { setIsOpen: setOpenFeedbackDialog } = useFeedbackDialogStore();

  return (
    <div className="xl:hidden">
      <Drawer placement="left" isOpen={mobileMenuOpened} setIsOpen={setMobileMenuOpened}>
        <div className="flex flex-col justify-between h-full">
          <div className="py-6 grid gap-1">
            {[
              mobileLinks.map(({ href, iconName, title }) => {
                return (
                  <MobileLink
                    key={href}
                    href={href}
                    iconName={iconName}
                    title={title}
                    handleClose={() => setMobileMenuOpened(false)}
                    isActive={pathname.includes(href)}
                  />
                );
              }),
            ]}
            <div>
              <button
                onClick={() => setMoreOpened(!moreOpened)}
                className={clsx(
                  "flex w-full items-center justify-between py-3 px-4 hover:text-green duration-200",
                  moreOpened && "bg-navigation-active-mobile text-green",
                )}
              >
                <span className="flex gap-2">
                  <Svg iconName="more" />
                  More
                </span>
                <Svg
                  className={clsx(moreOpened && "-rotate-180", "duration-200")}
                  iconName="small-expand-arrow"
                />
              </button>
              <Collapse open={moreOpened}>
                <div className="flex flex-col py-4 px-5 bg-primary-bg rounded-2 shadow-popover gap-5">
                  <div className="flex flex-col text-16 text-primary-text gap-2">
                    <div className="text-secondary-text">Token</div>
                    <div className="opacity-50 pointer-events-none">Statistics</div>
                    <div className="opacity-50 pointer-events-none">Token lists</div>
                  </div>
                  <div className="flex flex-col text-16 text-primary-text gap-2">
                    <div className="text-secondary-text">Social media</div>
                    <a className="hover:text-green duration-200" href="https://t.me/Dex223_Defi">
                      Telegram discussions
                    </a>
                    <a className="hover:text-green duration-200" href="https://t.me/Dex_223">
                      Telegram announcements channel
                    </a>
                    <a className="hover:text-green duration-200" href="https://x.com/Dex_223">
                      DEX223 X account
                    </a>
                    <a
                      className="hover:text-green duration-200"
                      href="https://discord.gg/t5bdeGC5Jk"
                    >
                      Discord
                    </a>
                    <a className="hover:text-green duration-200" href="https://x.com/Dexaran">
                      Dexaran’s X account
                    </a>
                  </div>
                  <div className="flex flex-col text-16 text-primary-text gap-2">
                    <div className="text-secondary-text">Useful links</div>

                    <a
                      className="hover:text-green duration-200"
                      href="https://dexaran.github.io/token-converter/"
                    >
                      ERC20 & ERC223 token converter
                    </a>
                    <a
                      className="hover:text-green duration-200"
                      href="https://dexaran.github.io/erc20-losses/"
                    >
                      ERC-20 live losses calculator
                    </a>
                    <a
                      className="hover:text-green duration-200"
                      href="https://dexaran.github.io/erc223/"
                    >
                      ERC223 front page
                    </a>
                    <a
                      className="hover:text-green duration-200"
                      href="https://github.com/Dalcor/dex-exchange"
                    >
                      Page source codes
                    </a>
                  </div>
                  <div className="flex flex-col text-16 text-primary-text gap-2">
                    <div className="text-secondary-text">Partners</div>
                    <a className="hover:text-green duration-200" href="https://eossupport.io/">
                      EOS support
                    </a>
                  </div>
                </div>
              </Collapse>
            </div>
          </div>
          <div className="flex flex-grow items-end gap-4 px-4 pb-4">
            <LocaleSwitcher isMobile={true} />
            <Button
              size={ButtonSize.MEDIUM}
              fullWidth
              variant={ButtonVariant.OUTLINED}
              endIcon="star"
              onClick={() => {
                setMobileMenuOpened(false);
                setOpenFeedbackDialog(true);
              }}
            >
              Feedback
            </Button>
          </div>
        </div>
      </Drawer>
      <IconButton
        buttonSize={IconButtonSize.LARGE}
        iconName="menu"
        onClick={() => setMobileMenuOpened(true)}
      />
    </div>
  );
}
