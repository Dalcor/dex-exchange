import clsx from "clsx";
import { ReactNode } from "react";

import Svg from "@/components/atoms/Svg";

export type AlertType = "success" | "info" | "error" | "warning";

interface Props {
  text: string;
  onDismiss: any;
  type?: AlertType;
}

const iconsMap: Record<AlertType, ReactNode> = {
  success: <Svg iconName="done" />,
  info: <Svg iconName="info" />,
  error: <Svg iconName="warning" />,
  warning: <Svg iconName="warning" />,
};

export default function Alert({ text, type = "success" }: Props) {
  return (
    <div
      className={clsx(
        `
        relative
        flex
        items-center
        outline
        rounded-2
        gap-2
        px-5
        py-2
        overflow-hidden
        group
        text-14
        `,
        type === "success" && "outline-green bg-green-bg",
        type === "error" && "outline-red bg-red-bg",
        type === "warning" && "outline-orange bg-orange-bg",
        type === "info" && "outline-blue bg-blue-bg",
      )}
    >
      <div
        className={clsx(
          "flex items-center justify-center flex-shrink-0",
          type === "success" && "text-green",
          type === "error" && "text-red",
          type === "warning" && "text-orange",
          type === "info" && "text-blue",
        )}
      >
        {iconsMap[type]}
      </div>
      {text}
    </div>
  );
}
