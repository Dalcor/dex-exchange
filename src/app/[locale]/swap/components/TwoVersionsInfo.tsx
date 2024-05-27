import clsx from "clsx";
import React, { useState } from "react";

import { useTwoVersionsInfoStore } from "@/app/[locale]/swap/stores/useTwoVersionsInfoStore";
import Collapse from "@/components/atoms/Collapse";
import Svg from "@/components/atoms/Svg";

export default function TwoVersionsInfo() {
  const { isOpened, setIsOpened } = useTwoVersionsInfoStore();

  return (
    <div className="bg-standard-gradient border-l-2 border-green rounded-2 overflow-hidden text-14">
      <button
        onClick={() => setIsOpened(!isOpened)}
        className="px-5 py-2 flex justify-between font-medium w-full items-center"
      >
        Tokens in ERC-20 and ERC-223 standards
        <Svg
          className={clsx(isOpened ? "-rotate-180" : "", "duration-200")}
          iconName="small-expand-arrow"
        />
      </button>
      <Collapse open={isOpened}>
        <div className="px-5 pb-2.5">
          Since July 27, 2023, all the tokens on Ethereum mainnet are available in two
          &quot;versions&quot;: ERC-20 and ERC-223. You can always convert one token version to
          another at a 1:1 rate. ERC-223 tokens may require less gas to be swapped for another
          token. Most centralized exchanges do not support ERC-223 deposits yet.
        </div>
      </Collapse>
    </div>
  );
}
