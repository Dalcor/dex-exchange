import Image from "next/image";

import { Token } from "@/sdk_hybrid/entities/token";

export default function TokensPair({
  tokenA,
  tokenB,
}: {
  tokenA?: Token | undefined;
  tokenB?: Token | undefined;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center">
        <span className="w-[26px] h-[26px] md:w-[34px] md:h-[34px] rounded-full bg-primary-bg flex items-center justify-center">
          <Image
            src={tokenA?.logoURI || ""}
            alt="Ethereum"
            width={32}
            height={32}
            className="h-[24px] w-[24px] md:h-[32px] md:w-[32px]"
          />
        </span>
        <span className="w-[26px] h-[26px] md:w-[34px] md:h-[34px] rounded-full bg-primary-bg flex items-center justify-center -ml-3.5">
          <Image
            src={tokenB?.logoURI || ""}
            alt="Ethereum"
            width={32}
            height={32}
            className="h-[24px] w-[24px] md:h-[32px] md:w-[32px]"
          />
        </span>
      </div>
      <span className="md:font-bold block">
        {tokenA?.symbol} / {tokenB?.symbol}
      </span>
    </div>
  );
}
