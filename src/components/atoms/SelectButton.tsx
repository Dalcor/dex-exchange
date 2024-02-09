import { ButtonHTMLAttributes, ForwardedRef, forwardRef, PropsWithChildren } from "react";
import Svg from "@/components/atoms/Svg";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  withArrow?: boolean,
  isOpen?: boolean,
  size?: "regular" | "large",
  fullWidth?: boolean
}

export const SelectButton = forwardRef(({ withArrow = true, isOpen = false, children, size = "regular", fullWidth = false, ...props }: PropsWithChildren<Props>, ref: ForwardedRef<HTMLButtonElement>) => {
  return <button ref={ref} {...props}
                 className={
                   clsx("border flex items-center gap-2 border-primary-border rounded-1 duration-200 text-base text-primary-text bg-secondary-bg hover:bg-tertiary-bg hover:border-hover-border",
                     !withArrow && "px-2",
                     withArrow && size === "regular" && "pl-5 pr-2",
                     withArrow && size === "large" && "px-5",
                     isOpen && "bg-tertiary-bg border-hover-border",
                     size === "large" && "py-3.5 text-24",
                     size === "regular" && "py-2",
                     fullWidth && "w-full justify-between"
                   )}>
    {children}

    {withArrow && <Svg className={clsx(isOpen ? "-rotate-180" : "", "duration-200")} iconName="expand-arrow"/>}
  </button>
})

SelectButton.displayName = 'SelectButton';

export default SelectButton;
