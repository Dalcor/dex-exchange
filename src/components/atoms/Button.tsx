import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "contained" | "outline",
  size?: "small" | "regular",
  fullWidth?: boolean
}

export default function Button({ children, variant = "contained", size = "regular", fullWidth = false, ...props }: Props) {
  return <button {...props}
                 className={clsx(
                   "rounded-1 duration-200 px-6",
                   variant === "contained" && "bg-green text-black hover:bg-green-hover border border-green",
                   variant === "outline" && "border-green text-font-white hover:text-green border",
                   size === "small" && "py-2 text-base",
                   size === "regular" && "py-4 text-lg",
                   fullWidth && "w-full"
                 )}>
    {children}
  </button>
}
