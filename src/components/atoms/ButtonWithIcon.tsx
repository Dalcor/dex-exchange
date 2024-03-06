import { ButtonHTMLAttributes } from "react";

import Svg from "@/components/atoms/Svg";
import { IconName } from "@/config/types/IconName";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  icon: IconName;
}
export default function ButtonWithIcon({ text, icon, ...props }: Props) {
  return (
    <button
      className="rounded-1 flex items-center justify-center gap-2 text-primary-text border
  border-font-primary hover:bg-white-hover duration-200 text-16 py-3"
      {...props}
    >
      {text}
      <Svg iconName={icon} />
    </button>
  );
}
