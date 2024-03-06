import clsx from "clsx";

import IconButton from "@/components/atoms/IconButton";
import Svg from "@/components/atoms/Svg";

interface Props {
  onClose: () => void;
  title: string;
  paragraph?: string;
  onBack?: () => void;
}
export default function DialogHeader({ onBack, onClose, title, paragraph }: Props) {
  return (
    <div className={clsx("h-[60px] flex items-center", onBack ? "px-6" : "pr-6 pl-10")}>
      <div className="flex items-center justify-between flex-grow">
        {onBack && (
          <IconButton onClick={onBack}>
            <Svg iconName="back" />
          </IconButton>
        )}
        <h2 className="text-20 font-bold">{title}</h2>
        <IconButton onClick={onClose}>
          <Svg iconName="close" />
        </IconButton>
      </div>

      {paragraph && <p className="mt-2 text-16 text-secondary-text">{paragraph}</p>}
    </div>
  );
}
