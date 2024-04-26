import clsx from "clsx";
import React, { PropsWithChildren } from "react";

interface Props {
  isActive: boolean;
  onClick: () => void;
}

export default function RadioButton({ isActive, children, onClick }: PropsWithChildren<Props>) {
  return (
    <button
      className={clsx(
        "duration-200 h-10 flex justify-between px-5 items-center rounded-2 group hover:shadow-checkbox gap-2 bg-secondary-bg hover:text-primary-text",
        isActive ? "text-primary-text" : "text-secondary-text",
      )}
      onClick={onClick}
    >
      <span
        className={clsx(
          "duration-200 w-4 h-4 rounded-full border flex items-center bg-tertiary-bg justify-center group-hover:border-green",
          isActive ? "border-green" : "border-secondary-border",
        )}
      >
        <span
          className={clsx(
            "duration-200 w-2.5 h-2.5 rounded-full bg-green",
            isActive ? "opacity-100 shadow-checkbox" : "opacity-0",
          )}
        />
      </span>
      <span>{children}</span>
    </button>
  );
}
