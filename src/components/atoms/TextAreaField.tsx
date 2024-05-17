import clsx from "clsx";
import { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

import Input from "@/components/atoms/Input";
import TextArea from "@/components/atoms/TextArea";
import Tooltip from "@/components/atoms/Tooltip";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  helperText?: ReactNode;
  tooltipText?: string;
} & (
    | {
        error?: string;
        warning?: never;
      }
    | { warning?: string; error?: never }
  );

export default function TextAreaField({
  label,
  helperText,
  error,
  warning,
  tooltipText,
  ...props
}: Props) {
  return (
    <div>
      <p
        className={clsx(
          "text-16 font-bold mb-1 flex items-center gap-1",
          props.disabled && "opacity-50",
        )}
      >
        {label}
        {tooltipText && <Tooltip iconSize={20} text={tooltipText} />}
      </p>
      <TextArea isError={Boolean(error)} isWarning={Boolean(warning)} {...props} />
      {typeof helperText !== "undefined" && !error && (
        <div
          className={clsx("text-12 text-secondary-text mt-0.5 h-4", props.disabled && "opacity-50")}
        >
          {helperText}
        </div>
      )}
      {error && <p className="text-12 text-red mt-0.5">{error}</p>}
      {warning && <p className="text-12 text-orange mt-0.5">{warning}</p>}
    </div>
  );
}
