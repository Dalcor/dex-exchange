import React, { SVGProps } from "react";

import { IconName } from "@/config/types/IconName";

interface Props extends SVGProps<SVGSVGElement> {
  iconName: IconName;
  sprite?: "sprite" | "social";
  size?: number;
  style?: React.CSSProperties;
}

export default function Svg({ iconName, size = 24, style, sprite = "sprite", ...rest }: Props) {
  return (
    <svg
      style={{
        width: size,
        height: size,
        ...style,
      }}
      {...rest}
    >
      <use xlinkHref={`/${sprite}.svg#${iconName}`} />
    </svg>
  );
}
