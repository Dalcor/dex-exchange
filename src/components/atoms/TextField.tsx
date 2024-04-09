import clsx from "clsx";
import { InputHTMLAttributes, ReactNode } from "react";

import Input from "@/components/atoms/Input";
import Tooltip from "@/components/atoms/Tooltip";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: ReactNode;
  error?: string;
  tooltipText?: string;
}

export default function TextField({ label, helperText, error, tooltipText, ...props }: Props) {
  return (
    <div>
      <p
        className={clsx(
          "text-14 font-bold mb-1 flex items-center gap-1",
          props.disabled && "opacity-50",
        )}
      >
        {label}
        {tooltipText && <Tooltip iconSize={20} text={tooltipText} />}
      </p>
      <Input isError={Boolean(error)} {...props} />
      {typeof helperText !== "undefined" && !error && (
        <div
          className={clsx("text-12 text-secondary-text mt-0.5 h-4", props.disabled && "opacity-50")}
        >
          {helperText}
        </div>
      )}
      {error && <p className="text-12 text-red mt-0.5">{error}</p>}
    </div>
  );
}
