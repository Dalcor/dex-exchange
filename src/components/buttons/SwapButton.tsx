import React, { ButtonHTMLAttributes, useState } from "react";

import { Field } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import Svg from "@/components/atoms/Svg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void;
}
export default function SwapButton({ onClick, ...props }: Props) {
  const [effect, setEffect] = useState(false);

  return (
    <button
      onClick={() => {
        setEffect(true);
        onClick();
      }}
      {...props}
      className="border-[3px] text-green border-tertiary-bg outline outline-tertiary-bg  w-10 h-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-secondary-bg rounded-full flex items-center justify-center duration-200 hover:outline-green hover:shadow-checkbox"
    >
      <Svg
        className={effect ? "animate-swap" : ""}
        onAnimationEnd={() => setEffect(false)}
        iconName="swap"
      />
    </button>
  );
}
