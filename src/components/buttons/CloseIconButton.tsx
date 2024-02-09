import Svg from "@/components/atoms/Svg";
import { IconName } from "@/config/types/IconName";
import { ButtonHTMLAttributes, ForwardedRef, forwardRef } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement>{
  handleClose: () => void
}

export default function CloseIconButton({ handleClose, ...props }: Props) {
  return <button {...props} onClick={handleClose} className={`
    w-10
    h-10
    bg-transparent
    text-secondary-text
    hover:bg-secondary-bg
    hover:text-primary-text
    flex
    items-center
    justify-center
    duration-200
    rounded-full
    flex-shrink-0
  `}>
    <Svg iconName="close" />
  </button>
}
