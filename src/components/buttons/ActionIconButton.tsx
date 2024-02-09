import { ButtonHTMLAttributes } from "react";
import { IconName } from "@/config/types/IconName";
import Svg from "@/components/atoms/Svg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement>{
  icon: IconName,
  svgClassname?: string
}
export default function ActionIconButton({icon, svgClassname = "", ...props}: Props) {
  return <button {...props} className={`
    w-10
    h-10
    rounded-full
    bg-transparent
    text-green
    hover:bg-green/20
    flex
    items-center
    justify-center
    duration-200
    flex-shrink-0
  `}>
    <Svg className={svgClassname} iconName={icon}/>
  </button>
}
