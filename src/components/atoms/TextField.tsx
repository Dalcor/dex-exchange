import { InputHTMLAttributes } from "react";
import Input from "@/components/atoms/Input";
import Tooltip from "@/components/atoms/Tooltip";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string,
  helperText?: string,
  error?: string,
  tooltipText?: string
}

export default function TextField({label, helperText, error, tooltipText, ...props }: Props) {
  return <div>
    <p className="text-16 font-bold mb-1 flex items-center gap-1">
      {label}
      {tooltipText && <Tooltip text={tooltipText} />}
    </p>
    <Input
      isError={Boolean(error)}
      {...props}
    />
    {typeof helperText !== "undefined" && !error && <p className="text-12 text-font-secondary mt-0.5 h-4">{helperText}</p>}
    {error && <p className="text-12 text-red mt-0.5">{error}</p>}
  </div>
}
