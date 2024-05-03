import { useTranslations } from "next-intl";

import NavigationItem from "@/components/atoms/NavigationItem";
import { usePathname } from "@/navigation";

const menuItems: Array<{
  label: any;
  href: string;
}> = [
  {
    label: "trade",
    href: "/swap",
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
];

export default function Navigation() {
  const t = useTranslations("Trade");

  const pathname = usePathname();

  return (
    <ul className="hidden md:flex">
      {menuItems.map((menuItem) => {
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
