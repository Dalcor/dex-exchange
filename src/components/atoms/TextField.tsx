import clsx from "clsx";
import { InputHTMLAttributes, ReactNode } from "react";

import Input from "@/components/atoms/Input";
import Tooltip from "@/components/atoms/Tooltip";

type Props = InputHTMLAttributes<HTMLInputElement> & {
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

export function InputLabel({ label, tooltipText, ...props }: Omit<Props, "helperText">) {
  return (
    <p
      className={clsx(
        "text-16 font-bold mb-1 flex items-center gap-1",
        props.disabled && "opacity-50",
      )}
    >
      {label}
      {tooltipText && <Tooltip iconSize={24} text={tooltipText} />}
    </p>
  );
}

export default function TextField({
  label,
  helperText,
  error,
  warning,
  tooltipText,
  ...props
}: Props) {
  return (
    <div>
      <InputLabel label={label} tooltipText={tooltipText} />
      <Input isError={Boolean(error)} isWarning={Boolean(warning)} {...props} />
      <div className="text-12 mt-0.5 h-4">
        {typeof helperText !== "undefined" && !error && (
          <div
            className={clsx(
              "text-12 text-secondary-text mt-0.5 h-4",
              props.disabled && "opacity-50",
            )}
          >
            {helperText}
          </div>
        )}
        {error && <p className="text-12 text-red-input mt-0.5">{error}</p>}
        {warning && <p className="text-12 text-orange mt-0.5">{warning}</p>}
      </div>
    </div>
  );
}
