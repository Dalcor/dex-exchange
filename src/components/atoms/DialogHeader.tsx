import Svg from "@/components/atoms/Svg";
import clsx from "clsx";
import IconButton from "@/components/atoms/IconButton";

interface Props {
  onClose: () => void,
  title: string,
  paragraph?: string,
  onBack?: () => void
}
export default function DialogHeader({onBack, onClose, title, paragraph}: Props) {
  return <div className={clsx(
    "border-b border-b-primary-border",
    onBack ? "py-2.5 px-6" : "pt-2.5 pr-6 pb-2.5 pl-10"
  )}>
    <div className="flex items-center justify-between">
      {onBack && <IconButton onClick={onBack}>
        <Svg iconName="back"/>
      </IconButton>}
      <h2 className="text-20 font-bold">{title}</h2>
      <IconButton onClick={onClose}>
        <Svg iconName="close" />
      </IconButton>
    </div>

    {paragraph && <p className="mt-2 text-16 text-font-secondary">
      {paragraph}
    </p>}
  </div>;
}
