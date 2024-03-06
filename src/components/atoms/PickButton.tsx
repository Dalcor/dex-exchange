import clsx from "clsx";
import Image from "next/image";
import { ButtonHTMLAttributes, PropsWithChildren } from "react";

import AwaitingLoader from "@/components/atoms/AwaitingLoader";
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
        "flex flex-col gap-2 justify-center items-center py-4 border hover:border-green rounded-1 w-full duration-200",
        isActive
          ? "text-primary-text bg-green-bg border-green pointer-events-none"
          : "text-secondary-text border-primary-border",
      )}
      {...props}
    >
      <div className="relative">
        {loading ? (
          <AwaitingLoader size={32} />
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
