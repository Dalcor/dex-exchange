import clsx from "clsx";
import { useTranslations } from "next-intl";
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
  disabled = false,
}: {
  href: string;
  iconName: IconName;
  title: string;
  handleClose: () => void;
  isActive?: boolean;
  disabled?: boolean;
}) {
  return (
    <Link
      onClick={handleClose}
      href={href}
      className={clsx(
        "flex items-center gap-2 py-3 px-4 hover:text-green duration-200",
        isActive && "bg-navigation-active-mobile text-green pointer-events-none",
        disabled && "pointer-events-none opacity-50",
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
  title: any;
}[] = [
  {
    href: "/swap",
    iconName: "swap",
    title: "swap",
  },
  {
    href: "/margin-trading",
    iconName: "margin-trading",
    title: "margin_trading",
  },
  {
    href: "/pools",
    iconName: "pools",
    title: "pools",
  },
  {
    href: "/borrow",
    iconName: "borrow",
    title: "borrow_lend",
  },
  {
    href: "/portfolio",
    iconName: "portfolio",
    title: "portfolio",
  },
  {
    href: "#",
    iconName: "token",
    title: "token",
  },
];
export default function MobileMenu() {
  const t = useTranslations("Navigation");
  const tFeedback = useTranslations("Feedback");

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
                    title={t(title)}
                    handleClose={() => setMobileMenuOpened(false)}
                    isActive={pathname.includes(href)}
                    disabled={!["/swap", "/pools", "/portfolio"].includes(href)}
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
                  {t("more")}
                </span>
                <Svg
                  className={clsx(moreOpened && "-rotate-180", "duration-200")}
                  iconName="small-expand-arrow"
                />
              </button>
              <Collapse open={moreOpened}>
                <div className="flex flex-col py-4 px-5 bg-primary-bg rounded-2 shadow-popover gap-5">
                  <div className="flex flex-col text-16 text-primary-text gap-2">
                    <div className="text-secondary-text">{t("token")}</div>
                    <div className="opacity-50 pointer-events-none">{t("token_statistics")}</div>
                    <div className="opacity-50 pointer-events-none">{t("token_lists")}</div>
                  </div>
                  <div className="flex flex-col text-16 text-primary-text gap-2">
                    <div className="text-secondary-text">{t("social_media")}</div>
                    <a className="hover:text-green duration-200" href="https://t.me/Dex223_Defi">
                      {t("social_telegram_discussions")}
                    </a>
                    <a className="hover:text-green duration-200" href="https://t.me/Dex_223">
                      {t("social_telegram_announcements")}
                    </a>
                    <a className="hover:text-green duration-200" href="https://x.com/Dex_223">
                      {t("social_x_account")}
                    </a>
                    <a
                      className="hover:text-green duration-200"
                      href="https://discord.gg/t5bdeGC5Jk"
                    >
                      {t("social_discord")}
                    </a>
                    <a className="hover:text-green duration-200" href="https://x.com/Dexaran">
                      {t("social_dex_x_account")}
                    </a>
                  </div>
                  <div className="flex flex-col text-16 text-primary-text gap-2">
                    <div className="text-secondary-text">{t("useful_links")}</div>

                    <a
                      className="hover:text-green duration-200"
                      href="https://dexaran.github.io/token-converter/"
                    >
                      {t("useful_converter")}
                    </a>
                    <a
                      className="hover:text-green duration-200"
                      href="https://dexaran.github.io/erc20-losses/"
                    >
                      {t("useful_losses_calculator")}
                    </a>
                    <a
                      className="hover:text-green duration-200"
                      href="https://dexaran.github.io/erc223/"
                    >
                      {t("useful_front_page")}
                    </a>
                    <a
                      className="hover:text-green duration-200"
                      href="https://github.com/Dalcor/dex-exchange"
                    >
                      {t("useful_page_source_codes")}
                    </a>
                  </div>
                  <div className="flex flex-col text-16 text-primary-text gap-2">
                    <div className="text-secondary-text">{t("partners")}</div>
                    <a className="hover:text-green duration-200" href="https://eossupport.io/">
                      {t("partners_eos_support")}
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
              {tFeedback("feedback")}
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
