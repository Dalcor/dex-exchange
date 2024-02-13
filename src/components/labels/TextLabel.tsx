import clsx from "clsx";

interface Props {
  color: "blue" | "red" | "grey",
  text: string
}
export default function TextLabel({color, text}: Props) {
  return <div className={clsx(
    "rounded-5 px-3 text-16 border flex items-center gap-1",
    color === "blue" && "text-blue border-blue bg-blue-bg",
    color === "red" && "text-red border-red bg-red-bg",
    color === "grey" && "text-secondary-text border-primary-border bg-tertiary-bg",
  )}>
    {text}
  </div>
}
