import clsx from "clsx";
import { IconName } from "@/config/types/IconName";
import Svg from "@/components/atoms/Svg";

interface Props {
  status: "in-range" | "out-of-range" | "closed"
}

const iconsMap: {
  [key: string]: IconName
} = {
  "in-range": "check",
  "out-of-range": "error",
  "closed": "closed"
}

const textMap: {
  [key: string]: string
} = {
  "in-range": "In range",
  "out-of-range": "Out of range",
  "closed": "Closed"
}
export default function PoolStatusLabel({status}: Props) {
  return <div className={clsx(
    "rounded-5 pl-3 pr-1 py-1 border flex items-center gap-1",
    status === "in-range" && "text-green border-green bg-green-bg",
    status === "out-of-range" && "text-orange border-orange bg-orange-bg",
    status === "closed" && "text-placeholder-text border-placeholder-text bg-tertiary-bg",
  )}>
    {textMap[status]}
    <Svg iconName={iconsMap[status]} />
  </div>
}
