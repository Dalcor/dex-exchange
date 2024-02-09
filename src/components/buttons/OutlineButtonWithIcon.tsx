import { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { IconName } from "@/config/types/IconName";
import Svg from "@/components/atoms/Svg";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName
  variant?: "contained" | "outlined",
  fullWidth?: boolean,
  mode?: "default" | "error",
}
export default function OutlineButtonWithIcon({variant = "contained", fullWidth = false, mode = "default", icon, children, ...props}: PropsWithChildren<Props>) {
  return <button {...props} className={`
    h-10
    rounded-25
    px-6
    font-medium
    border
    duration-200
    flex
    items-center
    gap-1
    justify-center
    disabled:bg-transparent
    disabled:text-grey-light
    disabled:border-grey-light
    "text-primary-text bg-transparent"
    ${mode === "default" ? "border-green hover:bg-green/20" : "border-red hover:bg-red/10"}
    ${fullWidth && "w-full"}      
  `}>
    {children}
    <span className={clsx("w-6 h-6", mode === "default" ? "text-green" : "text-red")}>
      <Svg iconName={icon} />
    </span>
  </button>
}
