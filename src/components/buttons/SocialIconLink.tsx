import Svg from "@/components/atoms/Svg";
import { IconName } from "@/config/types/IconName";
import { ButtonHTMLAttributes, ForwardedRef, forwardRef } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement>{
  icon: IconName
}

export default function SocialIconButton({ icon, ...props }: Props) {
  return <button {...props} className={`
    w-10
    h-10
    rounded-full
    border
    border-green
    bg-transparent
    text-secondary-text
    hover:text-green
    flex
    items-center
    justify-center
    duration-200
  `}>
    <Svg iconName={icon}/>
  </button>
};
