import clsx from "clsx";
import CloseIconButton from "@/components/buttons/CloseIconButton";
import Svg from "@/components/atoms/Svg";

export type ToastType = "success" | "info" | "error" | "warning";

interface Props {
  text: string,
  onDismiss: any,
  type: ToastType
}

const iconsMap = {
  success: <Svg iconName="done" />,
  info: <Svg iconName="info" />,
  error: <Svg iconName="error" />,
  warning: <Svg iconName="warning" />,
}

export default function Toast({text, type, onDismiss}: Props) {
  return <div
    className={clsx(`
        min-w-[340px]
        relative
        flex
        justify-between
        items-center
        border
        rounded-2
        p-2.5
        overflow-hidden
        group
        bg-primary-bg
        `,
      type === "success" && "border-green",
      type === "error" && "border-red",
      type === "warning" && "border-orange",
      type === "info" && "border-blue",
    )}
  >
    <div className="flex gap-2.5 items-center">
      <div className={clsx(
        "w-10 h-10 rounded-2 flex items-center justify-center text-white flex-shrink-0",
        type === "success" && "bg-green",
        type === "error" && "bg-red",
        type === "warning" && "bg-orange",
        type === "info" && "bg-blue",
      )}>
        {iconsMap[type]}
      </div>
      {text}
    </div>

    <CloseIconButton handleClose={onDismiss}/>
  </div>
}
