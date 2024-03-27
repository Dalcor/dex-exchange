import clsx from "clsx";
import Image from "next/image";
import { ReactNode } from "react";

import Svg from "@/components/atoms/Svg";
import { IconName } from "@/config/types/IconName";

type BadgeTrustRate = "high" | "medium" | "low";

const iconsMap: Record<BadgeTrustRate, ReactNode> = {
  high: <Svg size={20} iconName="high-trust" />,
  medium: <Svg size={20} iconName="medium-trust" />,
  low: <Svg size={20} iconName="low-trust" />,
};

const textMap: Record<BadgeTrustRate, ReactNode> = {
  high: "Hight trust",
  medium: "Medium trust",
  low: "Low trust",
};

const internalTextMap: Record<BadgeTrustRate, ReactNode> = {
  high: "Trusted",
  medium: "Not enough data",
  low: "Scam",
};

function InternalTrustBadge({ rate }: Props) {
  return (
    <div
      className={clsx(
        "rounded-5 py-1 flex items-center gap-1 pl-2 pr-2 text-12",
        rate === "high" && "text-green bg-green-bg",
        rate === "medium" && "text-orange bg-orange-bg",
        rate === "low" && "text-red bg-red-bg",
      )}
    >
      {iconsMap[rate]}
      {internalTextMap[rate]}
    </div>
  );
}

function TooltipContent() {
  return (
    <div className="p-5 bg-primary-bg border border-secondary-border rounded-3 shadow-popup">
      <div className="grid grid-cols-3">
        <div className="flex justify-start">
          <InternalTrustBadge rate="low" />
        </div>
        <div className="flex justify-center">
          <InternalTrustBadge rate="medium" />
        </div>
        <div className="flex justify-end">
          <InternalTrustBadge rate="high" />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 h-[5px] relative">
        <div className="h-full bg-red" />
        <div className="h-full bg-orange" />
        <div className="h-full bg-green" />
        <div className="absolute border-[2px] border-green right-0 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full w-6 h-6 bg-primary-bg">
          <Image src="/tokens/placeholder.svg" alt="" width={20} height={20} />
        </div>
      </div>
      <div className="flex justify-between items-center text-secondary-text mt-4 mb-5 text-12 ">
        <span>-100</span>
        <span>0</span>
        <span>100</span>
      </div>
      <div className="p-5 rounded-3 bg-tertiary-bg flex flex-col gap-2">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Svg className="text-red" iconName="warning" />
            <span>The token isn’t in the default token list</span>
          </div>
          <span className="text-red">-40</span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Svg className="text-red" iconName="warning" />
            <span>The token isn’t in the default token list</span>
          </div>
          <span className="text-red">-40</span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Svg className="text-green" iconName="done" />
            <span>The token isn’t in the default token list</span>
          </div>
          <span className="text-green">-40</span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Svg className="text-green" iconName="done" />
            <span>The token isn’t in the default token list</span>
          </div>
          <span className="text-green">-40</span>
        </div>
      </div>
      <div className="flex mt-4 justify-between items-center text-14">
        <span>Total score</span>
        <span className="text-green font-bold">100</span>
      </div>
    </div>
  );
}

interface Props {
  rate: BadgeTrustRate;
  logoURI?: string;
}
export default function TrustBadge({ rate, logoURI }: Props) {
  return (
    <div className="relative">
      <div
        className={clsx(
          "rounded-5 py-1 flex items-center gap-1 pl-2 pr-1 cursor-pointer peer text-12",
          rate === "high" && "text-green bg-green-bg",
          rate === "medium" && "text-orange bg-orange-bg",
          rate === "low" && "text-red bg-red-bg",
        )}
      >
        {iconsMap[rate]}
        {textMap[rate]}
        <Svg size={20} iconName="info" />
      </div>
      <div className="absolute left-1/2 bottom-10 -translate-x-1/2 w-max opacity-0 peer-hover:opacity-100 duration-500 pointer-events-none">
        <TooltipContent />
      </div>
    </div>
  );
}
