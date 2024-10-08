import clsx from "clsx";
import { InputHTMLAttributes, ReactNode } from "react";

import Input, { SearchInput } from "@/components/atoms/Input";
import Tooltip from "@/components/atoms/Tooltip";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helperText?: ReactNode;
  tooltipText?: string;
  variant?: "default" | "search";
  internalText?: string;
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
//TODO: add custom copmonent to pass instead of Input, for example Search Input
export default function TextField({
  label,
  helperText,
  error,
  warning,
  tooltipText,
  variant = "default",
  internalText,
  ...props
}: Props) {
  return (
    <div>
      <InputLabel label={label} tooltipText={tooltipText} />
      {variant === "default" ? (
        <div className="relative">
          <Input isError={Boolean(error)} isWarning={Boolean(warning)} {...props} />
          {internalText && (
            <span className="absolute right-5 text-tertiary-text top-1/2 -translate-y-1/2">
              {internalText}
            </span>
          )}
        </div>
      ) : (
        <SearchInput isError={Boolean(error)} isWarning={Boolean(warning)} {...props} />
      )}

      <div className="text-12 mt-1 h-4">
        {typeof helperText !== "undefined" && !error && (
          <div
            className={clsx("text-12 text-secondary-text mt-1 h-4", props.disabled && "opacity-50")}
          >
            {helperText}
          </div>
        )}
        {error && <p className="text-12 text-red-input mt-1">{error}</p>}
        {warning && <p className="text-12 text-orange mt-1">{warning}</p>}
      </div>
    </div>
  );
}
