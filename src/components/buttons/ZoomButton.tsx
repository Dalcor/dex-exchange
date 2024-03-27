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
      className="w-8 h-8 outline-0 rounded-full text-primary-text flex items-center justify-center hover:bg-green-bg duration-200"
    >
      <Svg iconName={icon} />
    </button>
  );
}
