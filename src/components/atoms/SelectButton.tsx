import clsx from "clsx";
import { ButtonHTMLAttributes, ForwardedRef, forwardRef, PropsWithChildren } from "react";

import Svg from "@/components/atoms/Svg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  withArrow?: boolean;
  isOpen?: boolean;
  size?: "regular" | "large";
  fullWidth?: boolean;
  variant?: "rounded-primary" | "rounded-secondary" | "rectangle-primary";
}

export const SelectButton = forwardRef(
  (
    {
      withArrow = true,
      isOpen = false,
      children,
      size = "regular",
      fullWidth = false,
      variant = "rectangle-primary",
      ...props
    }: PropsWithChildren<Props>,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    return (
      <button
        ref={ref}
        {...props}
        className={clsx(
          "flex items-center gap-2 duration-[600ms] text-base text-primary-text",
          variant === "rectangle-primary" && "rounded-1 bg-primary-bg hover:bg-tertiary-hover",
          variant === "rounded-primary" &&
            "rounded-[80px] border border-transparent bg-primary-bg hover:bg-active-bg hover:shadow-select hover:border-green",
          variant === "rounded-secondary" &&
            "rounded-[80px] border border-transparent bg-secondary-bg hover:bg-active-bg hover:shadow-select hover:border-green",
          !withArrow && "px-2",
          withArrow && size === "regular" && "pl-5 pr-2",
          withArrow && size === "large" && "px-5",
          isOpen && "bg-tertiary-bg border-hover-border",
          size === "large" && "py-3.5 text-24",
          size === "regular" && "py-2",
          fullWidth && "w-full justify-between",
        )}
      >
        {children}

        {withArrow && (
          <Svg
            className={clsx(isOpen ? "-rotate-180" : "", "duration-200", "flex-shrink-0")}
            iconName="small-expand-arrow"
          />
        )}
      </button>
    );
  },
);

SelectButton.displayName = "SelectButton";

export default SelectButton;
