import { ButtonHTMLAttributes, ForwardedRef, forwardRef, PropsWithChildren } from "react";
import Svg from "@/components/atoms/Svg";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  withArrow?: boolean,
  isOpen?: boolean,
  size?: "regular" | "large"
}

export const SelectButton = forwardRef(({ withArrow = true, isOpen = false, children, size = "regular", ...props }: PropsWithChildren<Props>, ref: ForwardedRef<HTMLButtonElement>) => {
  return <button ref={ref} {...props}
                 className={
                   clsx("border flex items-center gap-2 border-primary-border rounded-1 duration-200 text-base text-font-primary bg-input-fill hover:bg-table-fill hover:border-hover-border",
                     withArrow ? "pl-5 pr-2" : "px-2",
                     isOpen && "bg-table-fill border-hover-border",
                     size === "large" && "py-2.5",
                     size === "regular" && "py-2"
                   )}>
    {children}

    {withArrow && <Svg className={clsx(isOpen ? "-rotate-180" : "", "duration-200")} iconName="expand-arrow"/>}
  </button>
})

SelectButton.displayName = 'SelectButton';

export default SelectButton;
