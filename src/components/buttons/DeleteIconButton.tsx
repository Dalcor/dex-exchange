import Svg from "@/components/atoms/Svg";
import { ButtonHTMLAttributes } from "react";
import { IconName } from "@/config/types/IconName";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "default" | "large",
  iconSize?: 24 | 32
}

export default function DeleteIconButton({ size = "default", iconSize = 24, ...props }: Props) {
  return <button
    {...props}
    className={
      clsx(
        "duration-200 rounded-full bg-transparent flex items-center justify-center text-placeholder-text hover:bg-red-bg hover:text-red",
        size === "default" && "w-10 h-10",
        size === "large" && "w-12 h-12"
      )
    }
  >
    <Svg iconName="delete" size={iconSize} />
  </button>
}

