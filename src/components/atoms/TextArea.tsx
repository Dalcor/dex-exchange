import clsx from "clsx";
import { FieldProps } from "formik";
import { TextareaHTMLAttributes } from "react";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  isError?: boolean;
  isWarning?: boolean;
}

export default function TextArea({ isError = false, isWarning = false, ...props }: Props) {
  return (
    <textarea
      className={clsx(
        "duration-200 focus:outline-0 px-5 py-3 align-top placeholder:text-tertiary-text text-16 w-full bg-secondary-bg rounded-2 border",
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
