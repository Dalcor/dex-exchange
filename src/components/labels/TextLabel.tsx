import clsx from "clsx";

interface Props {
  color: "blue" | "red" | "grey" | "green";
  text: string;
}
export default function TextLabel({ color, text }: Props) {
  return (
    <div
      className={clsx(
        "rounded-5 border flex items-center gap-1",
        color === "blue" && "text-16 text-blue border-blue bg-blue-bg px-3",
        color === "green" && "text-12 text-green border-green bg-active-bg px-2 py-[2px]",
        color === "red" && "text-16 text-red border-red bg-red-bg px-3",
        color === "grey" && "text-16 text-secondary-text border-primary-border bg-tertiary-bg px-3",
      )}
    >
      {text}
    </div>
  );
}
