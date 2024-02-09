import { ButtonHTMLAttributes, ForwardedRef, forwardRef, PropsWithChildren } from "react";
import Svg from "@/components/atoms/Svg";
import clsx from "clsx";
import SystemIconButton from "@/components/buttons/SystemIconButton";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  isOpened?: boolean
}
const SelectButton = forwardRef(({isOpened = false, children, ...props}: PropsWithChildren<Props>, ref: ForwardedRef<HTMLButtonElement>) => {
  return <button ref={ref} {...props} className={`
    w-10
    h-10
    rounded-full
    border-0
    duration-200
    flex
    items-center
    justify-center  
    hover:bg-secondary-hover,
    hover:bg-secondary-bg
    hover:text-primary-text
    flex-shrink-0
  `}>
    <Svg className={clsx("duration-200", isOpened ? "-rotate-180" : "")} iconName="arrow-bottom" />
  </button>
})

SelectButton.displayName = 'SelectButton';
export default SelectButton;
