import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "contained" | "outline",
  size?: "small" | "regular"
}

const classes = {
  base: "rounded-1 duration-200 px-6",
  variant: {
    contained: "bg-green text-black hover:bg-green-hover border border-green",
    outline: "border-green text-font-white hover:text-green border"
  },
  size: {
    small: "py-2 text-base",
    regular: "py-4 text-lg"
  }
}

export default function Button({ children, variant = "contained", size = "regular", ...props }: Props) {
  return <button {...props}
                 className={clsx(
                   classes.base,
                   classes.variant[variant],
                   classes.size[size]
                 )}>
    {children}
  </button>
}
