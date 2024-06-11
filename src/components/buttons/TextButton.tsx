import clsx from "clsx";
import { ButtonHTMLAttributes, PropsWithChildren } from "react";

import Svg from "@/components/atoms/Svg";
import { IconName } from "@/config/types/IconName";
import { clsxMerge } from "@/functions/clsxMerge";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  endIcon?: IconName;
}

export default function TextButton({
  color = "green",
  endIcon,
  children,
  className,
  ...props
}: PropsWithChildren<Props>) {
  return (
    <button
      className={clsxMerge(
        "rounded-2 flex items-center justify-center gap-2 px-6 duration-200",
        props.disabled
          ? "opacity-50 pointer-events-none text-tertiary-text"
          : "text-green hover:text-green-hover",
        className,
      )}
      {...props}
    >
      {children}
      {endIcon && <Svg iconName={endIcon} />}
    </button>
  );
}
