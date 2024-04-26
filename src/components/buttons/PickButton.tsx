import clsx from "clsx";
import Image from "next/image";
import { ButtonHTMLAttributes, PropsWithChildren } from "react";

import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  onClick: any;
  image: string;
  label: string;
  loading?: boolean;
}

export default function PickButton({
  isActive = false,
  loading = false,
  image,
  label,
  ...props
}: PropsWithChildren<Props>) {
  return (
    <button
      className={clsx(
        "flex flex-col gap-2 justify-center items-center py-4 border rounded-3 w-full duration-200 px-2 hover:",
        isActive
          ? "text-primary-text bg-green-bg border-green shadow-checkbox"
          : "text-secondary-text bg-secondary-bg border-transparent hover:bg-green-bg",
      )}
      {...props}
    >
      <div className="relative">
        {loading ? (
          <Preloader size={32} type="awaiting" />
        ) : (
          <Image src={image} alt={label} width={32} height={32} />
        )}
        <span
          className={clsx(
            "w-5 h-5 absolute text-green flex items-center justify-center -right-1.5 -bottom-[5px] opacity-0 duration-200",
            isActive ? "opacity-100" : "opacity-0",
          )}
        >
          <span className="absolute bg-green-bg rounded-full w-[18px] h-[18px]" />
          <Svg size={19} iconName="success" className="z-10 absolute" />
        </span>
      </div>
      <span className="text-14">{label}</span>
    </button>
  );
}
