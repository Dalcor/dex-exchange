import { ButtonHTMLAttributes } from "react";
import { IconName } from "@/config/types/IconName";
import Svg from "@/components/atoms/Svg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement>{
  icon: IconName
}
export default function InlineIconButton({icon, className, ...props}: Props) {
  return <button {...props} className={`
    w-5
    h-5
    rounded-full
    bg-transparent
    text-green
    hover:text-green-saturated
    flex
    items-center
    justify-center
    duration-200
    relative
    after:absolute
    after:w-10
    after:h-10
    after:left-1/2
    after:top-1/2
    after:-translate-x-1/2
    after:-translate-y-1/2
    ${className}
  `}>
    <Svg size={20} iconName={icon}/>
  </button>
}
