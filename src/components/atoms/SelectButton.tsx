import clsx from "clsx";
import { ButtonHTMLAttributes, ForwardedRef, forwardRef, PropsWithChildren } from "react";

import Svg from "@/components/atoms/Svg";
import { clsxMerge } from "@/functions/clsxMerge";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  withArrow?: boolean;
  isOpen?: boolean;
  size?: "regular" | "large";
  fullWidth?: boolean;
  variant?: "rounded-primary" | "rounded-secondary" | "rectangle-primary" | "rectangle-secondary";
  className?: string;
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
      className,
      ...props
    }: PropsWithChildren<Props>,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    return (
      <button
        ref={ref}
        {...props}
        className={clsxMerge(
          "flex items-center gap-2 duration-[600ms] text-base text-primary-text",
          variant === "rectangle-primary" ||
            (variant === "rectangle-secondary" && "rounded-2  hover:bg-green-bg"),
          variant === "rounded-primary" &&
            "rounded-[80px] border border-transparent hover:bg-green-bg hover:shadow-select hover:border-green",
          variant === "rounded-secondary" &&
            "rounded-[80px] border border-transparent hover:bg-green-bg hover:shadow-select hover:border-green",
          isOpen
            ? "bg-green-bg"
            : variant !== "rounded-secondary" && variant !== "rectangle-secondary"
              ? "bg-primary-bg"
              : "bg-secondary-bg",
          size === "large" && "p-2 md:px-5 md:py-3.5 md:text-24 ",
          size === "regular" && "py-2 px-3",
          fullWidth && withArrow && "w-full justify-between",
          fullWidth && !withArrow && "w-full justify-center",
          className,
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
