import clsx from "clsx";
import { className } from "postcss-selector-parser";
import { ChangeEvent, forwardRef, InputHTMLAttributes, useRef } from "react";

import Svg from "@/components/atoms/Svg";
import IconButton, { IconButtonVariant } from "@/components/buttons/IconButton";
import { clsxMerge } from "@/functions/clsxMerge";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
  isWarning?: boolean;
}

const Input = forwardRef<HTMLInputElement | null, Props>(function Input(
  { isError = false, isWarning = false, className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={clsxMerge(
        "duration-200 focus:outline-0 h-12 pl-5 placeholder:text-tertiary-text text-16 w-full bg-secondary-bg rounded-2 border",
        !isError &&
          !isWarning &&
          "border-transparent hover:shadow-checkbox focus:shadow-checkbox focus:border-green",
        isError && "border-red-input hover:shadow-error focus:shadow-error",
        isWarning && "border-orange hover:shadow-warning focus:shadow-warning",
        props.disabled && "opacity-50 pointer-events-none",
        props.readOnly && "pointer-events-none bg-primary-bg border-secondary-border",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;

export function SearchInput(props: Props) {
  const ref = useRef<HTMLInputElement | null>(null);

  const handleClear = () => {
    if (props.onChange) {
      props.onChange({ target: { value: "" } } as ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className="relative w-full">
      <Input className={clsxMerge(props.className, "pr-12")} ref={ref} {...props} />
      <span
        className={clsx(
          "absolute right-2 flex items-center justify-center h-full w-10 top-0",
          props.value === "" && "pointer-events-none",
        )}
      >
        {props.value === "" ? (
          <Svg className="text-secondary-text" iconName="search" />
        ) : (
          <IconButton
            variant={IconButtonVariant.CLOSE}
            handleClose={() => {
              handleClear();
              ref.current?.focus();
            }}
          />
        )}
      </span>
    </div>
  );
}
