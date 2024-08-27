import clsx from "clsx";
import { AnchorHTMLAttributes } from "react";

import Svg from "@/components/atoms/Svg";
import { clsxMerge } from "@/functions/clsxMerge";

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  text: string;
  href: string;
  color?: "green" | "white";
}

export default function ExternalTextLink({
  text,
  href,
  color = "green",
  className,
  ...props
}: Props) {
  return (
    <a
      {...props}
      target="_blank"
      href={href}
      className={clsxMerge(
        "flex gap-2 items-center duration-200",
        color === "green" ? "text-green hover:text-green-hover" : "text-white hover:text-green",
        className,
      )}
    >
      {text}
      <Svg iconName="forward" />
    </a>
  );
}
