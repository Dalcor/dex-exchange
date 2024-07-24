import clsx from "clsx";
import { ReactNode } from "react";

import Svg from "@/components/atoms/Svg";
import IconButton, { IconButtonSize, IconButtonVariant } from "@/components/buttons/IconButton";

export type ToastType = "success" | "info" | "error" | "warning";

interface Props {
  text: string;
  onDismiss: any;
  type?: ToastType;
}

const iconsMap: Record<ToastType, ReactNode> = {
  success: <Svg iconName="done" />,
  info: <Svg iconName="info" />,
  error: <Svg iconName="warning" />,
  warning: <Svg iconName="warning" />,
};

export default function Toast({ text, type = "success", onDismiss }: Props) {
  return (
    <div
      className={clsx(
        `
        min-w-[340px]
        sm:min-w-[400px]
        relative
        flex
        justify-between
        items-center
        outline-1
        outline
        rounded-2
        gap-2
        pl-5
        overflow-hidden
        box-border
        py-2
        px-2
        `,
        type === "success" && "outline-green bg-green-bg",
        type === "error" && "outline-red bg-red-bg",
        type === "warning" && "outline-orange bg-orange-bg",
        type === "info" && "outline-blue bg-blue-bg",
      )}
    >
      <div className="flex gap-2 items-center">
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

      <IconButton
        buttonSize={IconButtonSize.LARGE}
        variant={IconButtonVariant.CLOSE}
        handleClose={onDismiss}
      />
    </div>
  );
}
