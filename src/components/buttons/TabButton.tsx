import clsx from "clsx";
import { ButtonHTMLAttributes, PropsWithChildren } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  size: 28 | 32 | 40 | 48 | 60;
  active: boolean;
  inactiveBackground?: "bg-secondary-bg" | "bg-primary-bg";
}
export default function TabButton({
  size,
  active,
  inactiveBackground = "bg-secondary-bg",
  children,
  ...props
}: PropsWithChildren<Props>) {
  return (
    <button
      className={clsx(
        "rounded-2 hover:bg-green-bg duration-200 border",
        size === 28 && "h-7 text-12",
        size === 32 && "h-8 text-12",
        size === 40 && "h-10 text-16",
        size === 48 && "h-12 text-16",
        size === 60 && "h-[60px] text-18",
        active
          ? "text-primary-text border-green bg-green-bg pointer-events-none"
          : "text-secondary-text border-transparent " + inactiveBackground,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
