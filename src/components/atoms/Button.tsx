import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "contained" | "outline";
  size?: "x-small" | "small" | "regular" | "large";
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "contained",
  size = "large",
  fullWidth = false,
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={clsx(
        "duration-200 px-6",
        variant === "contained" &&
          "bg-green text-black hover:bg-green-hover border border-green rounded-2",
        variant === "outline" && "border-green text-font-white hover:text-green border rounded-5",
        size === "x-small" && "h-[42px] text-base",
        size === "small" && "h-12 text-base",
        size === "regular" && "h-[48px] text-lg",
        size === "large" && "py-4 text-lg",
        props.disabled && "opacity-50 pointer-events-none",
        fullWidth && "w-full",
      )}
    >
      {children}
    </button>
  );
}
