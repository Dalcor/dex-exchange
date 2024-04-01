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
      className="duration-200 w-8 h-8 rounded-2 bg-secondary-bg flex items-center justify-center text-primary-text hover:bg-green-bg"
    >
      <Svg iconName={icon} />
    </button>
  );
}
