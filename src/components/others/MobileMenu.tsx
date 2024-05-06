import clsx from "clsx";
import { useState } from "react";

import Drawer from "@/components/atoms/Drawer";
import Svg from "@/components/atoms/Svg";
import IconButton, { IconButtonSize } from "@/components/buttons/IconButton";
import { IconName } from "@/config/types/IconName";
import { Link, usePathname } from "@/navigation";
import addToast from "@/other/toast";

function MobileLink({
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
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <Drawer placement="left" isOpen={mobileMenuOpened} setIsOpen={setMobileMenuOpened}>
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
