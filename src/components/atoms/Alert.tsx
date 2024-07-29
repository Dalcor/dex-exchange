import clsx from "clsx";
import { ReactNode } from "react";

import Svg from "@/components/atoms/Svg";

export type AlertType = "success" | "info" | "error" | "warning" | "info-border";

interface Props {
  text: string | ReactNode;
  withIcon?: boolean;
  type?: AlertType;
}

const iconsMap: Record<AlertType, ReactNode> = {
  success: <Svg className=" flex-shrink-0" iconName="done" />,
  info: <Svg className=" flex-shrink-0" iconName="info" />,
  error: <Svg className=" flex-shrink-0" iconName="warning" />,
  warning: <Svg className=" flex-shrink-0" iconName="warning" />,
  "info-border": <Svg className=" flex-shrink-0" iconName="info" />,
};

export default function Alert({ text, type = "success", withIcon = true }: Props) {
  return (
    <div
      className={clsx(
        `
        relative
        flex
        outline
        rounded-2
        gap-2
        px-5
        py-2
        overflow-hidden
        group
        text-14
        items-center
        `,
        type === "success" && "outline-green bg-green-bg",
        type === "error" && "outline-red-input bg-red-bg",
        type === "warning" && "outline-orange bg-orange-bg",
        type === "info" && "outline-blue bg-blue-bg",
        type === "info-border" &&
          "border-l-4 border-l-blue outline-0 bg-primary-bg text-secondary-text",
      )}
    >
      {withIcon && (
        <div
          className={clsx(
            "flex justify-center flex-shrink-0 items-center",
            type === "success" && "text-green",
            type === "error" && "text-red-input",
            type === "warning" && "text-orange",
            type === "info" && "text-blue",
            type === "info-border" && "text-blue",
          )}
        >
          {iconsMap[type]}
        </div>
      )}
      {text}
    </div>
  );
}
