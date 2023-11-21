import { useTranslation } from "@/providers/LocaleProvider";

const menuItems = [
  {
    label: "trade",
    href: "#"
  },
  {
    label: "Statistics",
    href: "#"
  },
  {
    label: "Lending & Borrowing",
    href: "#"
  },
  {
    label: "Liquidity",
    href: "#"
  },
  {
    label: "List your token",
    href: "#"
  }
]
export default function Navigation() {
  const { t } = useTranslation();

  return <ul className="flex gap-5">
    {menuItems.map((menuItem) => {
      return <li key={menuItem.label}>
        <a className="uppercase hover:text-green duration-200" href={menuItem.href}>{t("navigation", menuItem.label) || menuItem.label}</a>
      </li>
    })}
  </ul>
}
