import { InputHTMLAttributes } from "react";
import Input from "@/components/atoms/Input";
import Tooltip from "@/components/atoms/Tooltip";
import clsx from "clsx";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string,
  helperText?: string,
  error?: string,
  tooltipText?: string
}

export default function TextField({label, helperText, error, tooltipText, ...props }: Props) {
  return <div>
    <p className={clsx("text-16 font-bold mb-1 flex items-center gap-1", props.disabled && "opacity-50")}>
      {label}
      {tooltipText && <Tooltip text={tooltipText} />}
    </p>
    <Input
      isError={Boolean(error)}
      {...props}
    />
    {typeof helperText !== "undefined" && !error && <p className={clsx("text-12 text-secondary-text mt-0.5 h-4", props.disabled && "opacity-50")}>{helperText}</p>}
    {error && <p className="text-12 text-red mt-0.5">{error}</p>}
  </div>
}
