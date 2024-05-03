import clsx from "clsx";
import { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
  isWarning?: boolean;
}

export default function Input({ isError = false, isWarning = false, ...props }: Props) {
  return (
    <input
      className={clsx(
        "duration-200 focus:outline-0 h-12 pl-5 mb-[2px] placeholder:text-tertiary-text text-16 w-full bg-secondary-bg rounded-2 border",
        !isError &&
          !isWarning &&
          "border-transparent hover:shadow-checkbox focus:shadow-checkbox focus:border-green",
        isError && "border-red hover:shadow-error focus:shadow-error",
        isWarning && "border-orange hover:shadow-warning focus:shadow-warning",
        props.disabled && "opacity-50 pointer-events-none",
      )}
      {...props}
    />
  );
}
