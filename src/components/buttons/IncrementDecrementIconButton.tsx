import { ButtonHTMLAttributes } from "react";

import Svg from "@/components/atoms/Svg";
import { IconName } from "@/config/types/IconName";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: "add" | "minus";
}

export default function IncrementDecrementIconButton({ icon = "add", ...props }: Props) {
  return (
    <button
      {...props}
      className="duration-200 w-8 h-8 rounded-1 bg-transparent flex items-center justify-center text-primary-text border border-primary-border hover:border-primary-text"
    >
      <Svg iconName={icon} />
    </button>
  );
}
