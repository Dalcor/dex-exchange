import clsx from "clsx";

import Svg from "@/components/atoms/Svg";

export default function ExternalTextLink({
  text,
  href,
  color = "green",
}: {
  text: string;
  href: string;
  color?: "green" | "white";
}) {
  return (
    <a
      target="_blank"
      href={href}
      className={clsx(
        "flex gap-2 items-center duration-200",
        color === "green" ? "text-green hover:text-green-hover" : "text-white hover:text-green",
      )}
    >
      {text}
      <Svg iconName="forward" />
    </a>
  );
}
