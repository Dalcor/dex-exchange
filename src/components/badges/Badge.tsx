import clsx from "clsx";

interface Props {
  color: "blue" | "red" | "grey" | "green" | "purple";
  text: string;
  size?: "x-small" | "regular";
}
export default function Badge({ color, text, size }: Props) {
  return (
    <div
      className={clsx(
        "rounded-5 flex items-center gap-1",
        color === "blue" && "text-16 text-blue border-blue bg-blue-bg px-3",
        color === "green" && "text-green border-green border bg-green-bg px-2 py-[2px]",
        color === "purple" && "text-purple border-purple border bg-purple-bg px-2 py-[2px]",
        color === "red" && "text-16 text-red border-red bg-red-bg px-3",
        color === "grey" && "text-16 text-secondary-text bg-tertiary-bg px-2",
        color === "green" && size === "x-small" && "text-10",
        color === "green" && size === "regular" && "text-12",
        color === "purple" && size === "x-small" && "text-10",
        color === "purple" && size === "regular" && "text-12",
      )}
    >
      {text}
    </div>
  );
}
