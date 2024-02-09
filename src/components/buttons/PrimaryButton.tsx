import { ButtonHTMLAttributes, PropsWithChildren } from "react";
import AwaitingLoader from "@/components/atoms/AwaitingLoader";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "contained" | "outlined",
  fullWidth?: boolean,
  loading?: boolean
}
export default function PrimaryButton({variant = "contained", fullWidth = false, loading = false, children, ...props}: PropsWithChildren<Props>) {
  return <button {...props} className={`
    h-10
    rounded-25
    px-6
    font-medium
    border
    border-green
    duration-200
    flex
    items-center
    gap-1
    justify-center
    disabled:bg-transparent
    disabled:text-grey-light
    disabled:border-grey-light
    ${variant === "contained" 
      ? "text-white bg-green hover:bg-primary-hover hover:border-primary-hover" 
      : "text-primary-text bg-transparent hover:bg-green/20"}
    ${fullWidth && "w-full"}
    ${loading && "pointer-events-none"}      
  `}>
    {!loading ? children : <AwaitingLoader />}
  </button>
}
