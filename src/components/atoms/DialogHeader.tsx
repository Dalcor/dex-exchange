import clsx from "clsx";
import { ReactNode } from "react";

import Svg from "@/components/atoms/Svg";
import IconButton, { IconButtonSize, IconButtonVariant } from "@/components/buttons/IconButton";

interface Props {
  onClose: () => void;
  title: string;
  paragraph?: string;
  onBack?: () => void;
  settings?: ReactNode;
}
export default function DialogHeader({ onBack, onClose, title, paragraph, settings }: Props) {
  return (
    <div className={onBack ? "px-6" : "pr-6 pl-10"}>
      <div className={clsx("h-[60px] flex items-center")}>
        <div className={clsx("grid flex-grow", onBack ? "grid-cols-3" : "grid-cols-2")}>
          {onBack && <IconButton iconName="back" buttonSize={IconButtonSize.LARGE} />}
          <h2 className={clsx("text-20 font-bold flex items-center", onBack && "justify-center")}>
            {title}
          </h2>
          <div className="flex items-center gap-2 justify-end">
            {settings && settings}
            <IconButton variant={IconButtonVariant.CLOSE} handleClose={onClose} />
          </div>
        </div>
      </div>
      {paragraph && <p className="mt-2 text-16 text-secondary-text">{paragraph}</p>}
    </div>
  );
}
