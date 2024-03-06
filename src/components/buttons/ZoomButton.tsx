import { ButtonHTMLAttributes } from "react";

import Svg from "@/components/atoms/Svg";
import { IconName } from "@/config/types/IconName";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: "zoom-in" | "zoom-out";
}

export default function ZoomButton({ icon = "zoom-in", ...props }: Props) {
  return (
    <button
      {...props}
      className="w-9 h-9 border border-primary-border rounded-full text-placeholder-text flex items-center justify-center hover:text-primary-text hover:border-primary-text duration-200"
    >
      <Svg iconName={icon} />
    </button>
  );
}
