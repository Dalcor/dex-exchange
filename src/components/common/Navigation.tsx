import { useTranslations } from "next-intl";
import { ReactNode } from "react";

import NavigationItem, { NavigationItemWithSubmenu } from "@/components/atoms/NavigationItem";
import { MobileLink } from "@/components/common/MobileMenu";
import { usePathname } from "@/navigation";

const menuItems: Array<
  | {
      label: any;
      submenu: (handleClose: () => void, t: any) => ReactNode;
      activeFlags: string[];
    }
  | { label: any; href: string }
> = [
  {
    label: "trade",
    submenu: (handleClose, t) => (
      <div className="flex flex-col py-1 bg-primary-bg rounded-2 shadow-popover">
        <MobileLink href="/swap" iconName="swap" title={t("swap")} handleClose={handleClose} />
        <MobileLink
          href="/margin-trading"
          iconName="margin-trading"
          title={t("margin_trading")}
          handleClose={handleClose}
        />
      </div>
    ),
    activeFlags: ["/swap", "/margin-trading"],
  },
  {
    label: "pools",
    href: "/pools",
  },
  {
    label: "borrow_lend",
    href: "#",
  },
  {
    label: "portfolio",
    href: "/portfolio",
  },
  {
    label: "token_listing",
    href: "#",
  },
  {
    label: "",
    submenu: (handleClose, t) => (
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
          <a className="hover:text-green duration-200" href="https://discord.gg/t5bdeGC5Jk">
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
          <a className="hover:text-green duration-200" href="https://dexaran.github.io/erc223/">
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
    ),
    activeFlags: [],
  },
];

export default function Navigation() {
  const t = useTranslations("Navigation");

  const pathname = usePathname();

  return (
    <ul className="hidden xl:flex items-center">
      {menuItems.map((menuItem, index) => {
        if ("submenu" in menuItem) {
          return (
            <li key={menuItem.label + index}>
              <NavigationItemWithSubmenu
                title={menuItem.label ? t(menuItem.label) : ""}
                submenu={menuItem.submenu}
                active={pathname.includes(menuItem.activeFlags[0])}
              />
            </li>
          );
        }

        return (
          <li key={menuItem.label}>
            <NavigationItem
              title={t(menuItem.label)}
              href={menuItem.href}
              active={pathname.includes(menuItem.href)}
            />
          </li>
        );
      })}
    </ul>
  );
}
