import { ButtonHTMLAttributes, ForwardedRef, forwardRef, PropsWithChildren } from "react";
import Svg from "@/components/atoms/Svg";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  withArrow?: boolean,
  isOpen?: boolean
}

export const SelectButton = forwardRef(({ withArrow = true, isOpen = false, children, ...props }: PropsWithChildren<Props>, ref: ForwardedRef<HTMLButtonElement>) => {
  return <button ref={ref} {...props}
                 className={
                   clsx("border flex items-center gap-2 border-primary-border rounded-1 duration-200 py-2 text-base text-font-primary bg-input-fill hover:bg-table-fill hover:border-hover-border",
                     withArrow ? "pl-5 pr-2" : "px-2",
                     isOpen && "bg-table-fill border-hover-border"
                   )}>
    {children}

    {withArrow && <Svg className={clsx(isOpen ? "-rotate-180" : "", "duration-200")} iconName="expand-arrow"/>}
  </button>
})

SelectButton.displayName = 'SelectButton';

export default SelectButton;
