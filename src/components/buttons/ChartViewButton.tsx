import { ButtonHTMLAttributes } from "react";
import Svg from "@/components/atoms/Svg";
import { IconName } from "@/config/types/IconName";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean,
  icon: IconName
}
export default function SmallTabIconButton({isActive, icon, ...props}: Props) {
  return <button {...props} className={clsx(
    "p-0 rounded-0.5 flex items-center justify-center w-[22px] h-[22px] duration-200",
    isActive ? "bg-green text-white" : "bg-transparent text-grey-light"
  )}>
    <Svg size={20} iconName={icon} />
  </button>
}
