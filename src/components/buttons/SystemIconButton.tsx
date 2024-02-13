import Svg from "@/components/atoms/Svg";
import { ButtonHTMLAttributes } from "react";
import { IconName } from "@/config/types/IconName";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconName: IconName,
  size?: "default" | "large",
  iconSize?: 24 | 32
}

export default function SystemIconButton({ iconName = "zoom-in", size = "default", iconSize = 24, ...props }: Props) {
  return <button
    {...props}
    className={
    clsx(
      "duration-200 rounded-full bg-transparent flex items-center justify-center text-primary-text hover:bg-white/10",
     size === "default" && "w-10 h-10",
     size === "large" && "w-12 h-12"
    )
  }
  >
    <Svg iconName={iconName} size={iconSize} />
  </button>
}

