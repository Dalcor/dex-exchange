import Svg from "@/components/atoms/Svg";
import { IconName } from "@/config/types/IconName";
import { ButtonHTMLAttributes, ForwardedRef, forwardRef } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement>{
  icon: IconName
}

const SystemIconButton = forwardRef(({ icon, ...props }: Props, ref: ForwardedRef<HTMLButtonElement>) => {
  return <button ref={ref} {...props} className={`
    w-10
    h-10
    rounded-2
    bg-secondary-bg
    text-secondary-text
    hover:bg-secondary-hover
    hover:text-primary-text
    flex
    items-center
    justify-center
    duration-200
    flex-shrink-0
  `}>
    <Svg iconName={icon}/>
  </button>
})

SystemIconButton.displayName = 'SystemIconButton';
export default SystemIconButton;
