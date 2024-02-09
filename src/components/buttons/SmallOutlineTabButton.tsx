import { ButtonHTMLAttributes, PropsWithChildren } from "react";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
}
export default function SmallOutlineTabButton({ isActive, children, ...props }: PropsWithChildren<Props>) {
  return <button className={clsx(
    "rounded-1 border border-green duration-200 text-12 h-6 px-2 xl:px-[11px]",
    isActive ? "bg-green text-white" : "hover:bg-green/20 text-primary-text"
  )} {...props}>{children}</button>
}
