import clsx from "clsx";
import { ReactNode, useState } from "react";

import Popover from "@/components/atoms/Popover";
import Svg from "@/components/atoms/Svg";
import IconButton from "@/components/buttons/IconButton";
import { Link } from "@/navigation";

interface Props {
  href: string;
  title: string;
  active?: boolean;
}
export default function NavigationItem({ href, title, active }: Props) {
  return (
    <Link
      className={clsx(
        "px-3 py-5 duration-200",
        active ? "bg-navigation-active" : "hover:bg-navigation-hover",
      )}
      href={href}
    >
      {title}
    </Link>
  );
}

export function NavigationItemWithSubmenu({
  title,
  submenu,
}: {
  title: string;
  submenu: (handleClose: () => void) => ReactNode;
}) {
  const [isSubmenuOpened, setSubmenuOpened] = useState(false);

  return (
    <Popover
      isOpened={isSubmenuOpened}
      setIsOpened={setSubmenuOpened}
      placement="bottom-start"
      customOffset={12}
      trigger={
        <button
          onClick={() => setSubmenuOpened(!isSubmenuOpened)}
          className={clsx(
            "px-3 py-5 inline-flex items-center gap-1 duration-200",
            isSubmenuOpened ? "bg-navigation-active" : "hover:bg-navigation-hover",
          )}
        >
          {title ? <span>{title}</span> : null}
          <Svg className={isSubmenuOpened ? "rotate-180" : ""} iconName="small-expand-arrow" />
        </button>
      }
    >
      {submenu(() => setSubmenuOpened(false))}
    </Popover>
  );
}
