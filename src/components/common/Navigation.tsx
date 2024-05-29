import { useTranslations } from "next-intl";
import { ReactNode } from "react";

import NavigationItem, { NavigationItemWithSubmenu } from "@/components/atoms/NavigationItem";
import { MobileLink } from "@/components/common/MobileMenu";
import { usePathname } from "@/navigation";

const menuItems: Array<
  | {
      label: any;
      submenu: (handleClose: () => void) => ReactNode;
    }
  | { label: any; href: string }
> = [
  {
    label: "trade",
    submenu: (handleClose) => (
      <div className="flex flex-col py-1 bg-primary-bg rounded-2 shadow-popover">
        <MobileLink href="/swap" iconName="swap" title="Swap" handleClose={handleClose} />
        <MobileLink
          href="/margin-trading"
          iconName="margin-trading"
          title="Margin trading"
          handleClose={handleClose}
        />
      </div>
    ),
  },
  {
    label: "pools",
    href: "/pools",
  },
  {
    label: "lending-and-borrowing",
    href: "#",
  },
  {
    label: "portfolio",
    href: "/portfolio",
  },
  {
    label: "token-listing",
    href: "#",
  },
  {
    label: "",
    submenu: (handleClose) => (
      <div className="flex flex-col py-4 px-5 bg-primary-bg rounded-2 shadow-popover gap-5">
        <div className="flex flex-col text-16 text-primary-text gap-2">
          <div className="text-secondary-text">Token</div>
          <div>Statistics</div>
          <div>Token lists</div>
        </div>
        <div className="flex flex-col text-16 text-primary-text gap-2">
          <div className="text-secondary-text">Social media</div>
          <a href="#">Telegram discussions</a>
          <a href="#">Telegram discussions</a>
          <a href="#">DEX223 X account</a>
          <a href="#">Dexaran’s X account</a>
        </div>
        <div className="flex flex-col text-16 text-primary-text gap-2">
          <div className="text-secondary-text">Useful links</div>

          <a href="#">ERC20 & ERC223 token converter</a>
          <a href="#"> ERC-20 live losses calculator</a>
          <a href="#">ERC223 front page</a>
          <a href="#">Page source codes</a>
        </div>
        <div className="flex flex-col text-16 text-primary-text gap-2">
          <div className="text-secondary-text">Partners</div>
          <a href="#">EOS support</a>
        </div>
      </div>
    ),
  },
];

export default function Navigation() {
  const t = useTranslations("Trade");

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
