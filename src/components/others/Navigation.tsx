import { useTranslations } from "next-intl";

import { Link } from "@/navigation";

const menuItems: Array<{
  label: any;
  href: string;
}> = [
  {
    label: "trade",
    href: "/swap",
  },
  {
    label: "statistics",
    href: "#",
  },
  {
    label: "lending-and-borrowing",
    href: "#",
  },
  {
    label: "pools",
    href: "/pools",
  },
  {
    label: "list-your-token",
    href: "#",
  },
  {
    label: "lib",
    href: "/lib",
  },
];
export default function Navigation() {
  const t = useTranslations("Trade");

  return (
    <ul className="flex gap-5">
      {menuItems.map((menuItem) => {
        return (
          <li key={menuItem.label}>
            <Link className="uppercase hover:text-green duration-200" href={menuItem.href}>
              {t(menuItem.label)}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
