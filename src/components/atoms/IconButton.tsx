import React, { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: any,
  readonly?: boolean
}
export default function IconButton({ children, ...props }: Props) {
  return <button className={
    clsx(
      "w-10 h-10 flex justify-center items-center p-0 duration-200 text-font-secondary hover:text-font-primary border-0 outline-0 cursor-pointer"
    )} {...props}>
    {children}
  </button>;
}
