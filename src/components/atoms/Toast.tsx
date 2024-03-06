import clsx from "clsx";

import Svg from "@/components/atoms/Svg";
import SystemIconButton from "@/components/buttons/SystemIconButton";

export type ToastType = "success" | "info" | "error" | "warning";

interface Props {
  text: string;
  onDismiss: any;
  type: ToastType;
}

const iconsMap = {
  success: <Svg iconName="done" />,
  info: <Svg iconName="info" />,
  error: <Svg iconName="warning" />,
  warning: <Svg iconName="warning" />,
};

export default function Toast({ text, type, onDismiss }: Props) {
  return (
    <div
      className={clsx(
        `
        min-w-[340px]
        relative
        flex
        justify-between
        items-center
        border
        rounded-2
        p-2.5
        pl-4
        overflow-hidden
        group
        bg-primary-bg
        `,
        type === "success" && "border-green bg-green-bg",
        type === "error" && "border-red bg-red-bg",
        type === "warning" && "border-orange bg-orange-bg",
        type === "info" && "border-blue bg-blue-bg",
      )}
    >
      <div className="flex gap-2.5 items-center">
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

      <SystemIconButton onClick={onDismiss} iconName="close" />
    </div>
  );
}
