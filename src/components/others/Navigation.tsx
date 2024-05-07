import { useTranslations } from "next-intl";
import { ReactNode } from "react";

import NavigationItem, { NavigationItemWithSubmenu } from "@/components/atoms/NavigationItem";
import { MobileLink } from "@/components/others/MobileMenu";
import { Link, usePathname } from "@/navigation";

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
      <div className="flex flex-col py-4 px-5 bg-primary-bg rounded-2">
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
];

export default function Navigation() {
  const t = useTranslations("Trade");

  const pathname = usePathname();

  return (
    <ul className="hidden md:flex items-center">
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
