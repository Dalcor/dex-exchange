import { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean
}

export default function Input({ isError = false, ...props }: Props) {
  return <input
    className={clsx(
      "duration-200 focus:outline-0 py-3 pl-5 mb-[2px] placeholder:text-placeholder-text text-16 w-full bg-secondary-bg rounded-1 border",
      isError ? "border-red hover:border-red focus:border-red" : "border-primary-border hover:border-green focus:border-green"
    )}
    {...props}
  />
}