import clsx from "clsx";

import { Link } from "@/navigation";

interface Props {
  href: string;
  title: string;
  active?: boolean;
}
export default function NavigationItem({ href, title, active }: Props) {
  return (
    <Link
      className={clsx("px-3 py-5", active ? "bg-navigation-active" : "hover:bg-navigation-hover")}
      href={href}
    >
      {title}
    </Link>
  );
}
