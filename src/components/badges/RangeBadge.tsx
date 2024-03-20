import clsx from "clsx";
import { ReactNode } from "react";

import Svg from "@/components/atoms/Svg";
import { IconName } from "@/config/types/IconName";

interface Props {
  status: "in-range" | "out-of-range" | "closed";
}

const iconsMap: {
  [key: string]: ReactNode;
} = {
  "in-range": (
    <div className="w-6 h-6 flex justify-center items-center">
      <div className="w-2 h-2 rounded-full bg-green" />
    </div>
  ),
  "out-of-range": <Svg iconName="error" />,
  closed: <Svg iconName="closed" />,
};

const textMap: {
  [key: string]: string;
} = {
  "in-range": "In range",
  "out-of-range": "Out of range",
  closed: "Closed",
};
export default function RangeBadge({ status }: Props) {
  return (
    <div
      className={clsx(
        "rounded-5 py-1 flex items-center gap-1",
        status === "in-range" && "text-green",
        status === "out-of-range" && "text-orange border-orange bg-orange-bg",
        status === "closed" && "text-placeholder-text border-placeholder-text bg-tertiary-bg",
      )}
    >
      {textMap[status]}
      {iconsMap[status]}
    </div>
  );
}
