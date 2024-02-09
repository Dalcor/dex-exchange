import Svg from "@/components/atoms/Svg";
import { IconName } from "@/config/types/IconName";
import { ButtonHTMLAttributes, ForwardedRef, forwardRef } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement>{
  icon: IconName
}

export default function RoundedIconButton({ icon, ...props }: Props) {
  return <button {...props} className={`
    w-10
    h-10
    rounded-full
    bg-secondary-bg
    text-green
    hover:bg-green/20
    flex
    items-center
    justify-center
    duration-200
    disabled:pointer-events-none
    disabled:border
    disabled:border-secondary-bg
    disabled:text-primary-text
    disabled:bg-transparent
  `}>
    <Svg iconName={icon}/>
  </button>
};
