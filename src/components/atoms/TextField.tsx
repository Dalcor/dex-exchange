import { InputHTMLAttributes } from "react";
import Input from "@/components/atoms/Input";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string,
  helperText?: string,
  error?: string
}

export default function TextField({label, helperText, error, ...props }: Props) {
  return <div>
    <p className="text-16 font-bold mb-1">{label}</p>
    <Input
      isError={Boolean(error)}
      {...props}
    />
    {helperText && !error && <p className="text-12 text-font-secondary mt-0.5">{helperText}</p>}
    {error && <p className="text-12 text-red mt-0.5">{error}</p>}
  </div>
}
