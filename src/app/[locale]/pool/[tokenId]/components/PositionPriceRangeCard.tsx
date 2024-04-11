import { useMemo } from "react";

import { Token } from "@/sdk_hybrid/entities/token";

export default function PositionPriceRangeCard({
  price,
  token0,
  token1,
  showFirst,
  isMax = false,
}: {
  price?: string;
  token0: Token | undefined;
  token1: Token | undefined;
  showFirst: boolean;
  isMax?: boolean;
}) {
  const symbol = useMemo(() => {
    if (isMax) {
      return showFirst ? token0?.symbol : token1?.symbol;
    }

    return showFirst ? token1?.symbol : token0?.symbol;
  }, [isMax, showFirst, token0?.symbol, token1?.symbol]);

  return (
    <div className="rounded-3 overflow-hidden">
      <div className="py-3 px-5 flex items-center justify-center flex-col bg-quaternary-bg">
        <div className="text-14 text-secondary-text">{isMax ? "Max" : "Min"} price</div>
        <div className="text-18">{price}</div>
        <div className="text-14 text-secondary-text">
          {showFirst
            ? `${token0?.symbol} per ${token1?.symbol}`
            : `${token1?.symbol} per ${token0?.symbol}`}
        </div>
      </div>
      <div className="bg-quaternary-bg py-3 px-5 text-14 border-t-2 border-tertiary-bg text-secondary-text text-center">
        Your position will be 100% {symbol} at this price
      </div>
    </div>
  );
}
