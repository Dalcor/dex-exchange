import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  isActive: boolean;
}

export default function InputButton({ text, isActive, ...props }: Props) {
  return (
    <button
      {...props}
      className={clsx(
        "rounded-1 px-4 py-2 border border-primary-border hover:bg-secondary-bg",
        isActive ? "text-primary-text pointer-events-none bg-secondary-bg" : "text-secondary-text",
      )}
    >
      {text}
    </button>
  );
}
