import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "contained" | "outline",
  size?: "small" | "regular" | "large",
  fullWidth?: boolean
}

export default function Button({ children, variant = "contained", size = "large", fullWidth = false, ...props }: Props) {
  return <button {...props}
                 className={clsx(
                   "rounded-1 duration-200 px-6",
                   variant === "contained" && "bg-green text-black hover:bg-green-hover border border-green",
                   variant === "outline" && "border-green text-font-white hover:text-green border",
                   size === "small" && "py-2 text-base",
                   size === "regular" && "py-3 text-lg",
                   size === "large" && "py-4 text-lg",
                   fullWidth && "w-full"
                 )}>
    {children}
  </button>
}
