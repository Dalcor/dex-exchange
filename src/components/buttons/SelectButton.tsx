import { ButtonHTMLAttributes, ForwardedRef, forwardRef, PropsWithChildren } from "react";
import Svg from "@/components/atoms/Svg";
import clsx from "clsx";
import SystemIconButton from "@/components/buttons/SystemIconButton";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  isOpened?: boolean
}
const SelectButton = forwardRef(({isOpened = false, children, ...props}: PropsWithChildren<Props>, ref: ForwardedRef<HTMLButtonElement>) => {
  return <button ref={ref} {...props} className={`
    w-full
    xl:w-auto
    h-10
    rounded-2
    pl-4
    pr-3
    xl:pr-2.5
    font-medium
    border-0
    duration-200
    grid
    items-center
    gap-1
    grid-cols-svg-end
    bg-secondary-bg  
    hover:bg-secondary-hover
    relative
  `}>
    {children}
    <Svg className={clsx("duration-200", isOpened ? "-rotate-180" : "")} iconName="arrow-bottom" />
  </button>
})

SelectButton.displayName = 'SelectButton';
export default SelectButton;
