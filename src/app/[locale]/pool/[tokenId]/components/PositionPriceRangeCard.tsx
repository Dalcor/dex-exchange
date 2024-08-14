import { useMemo } from "react";

import { Token } from "@/sdk_hybrid/entities/token";

export default function PositionPriceRangeCard({
  price,
  tokenA,
  tokenB,
  showFirst,
  isMax = false,
}: {
  price?: string;
  tokenA: Token | undefined;
  tokenB: Token | undefined;
  showFirst: boolean;
  isMax?: boolean;
}) {
  const symbol = useMemo(() => {
    if (isMax) {
      return showFirst ? tokenA?.symbol : tokenB?.symbol;
    }

    return showFirst ? tokenB?.symbol : tokenA?.symbol;
  }, [isMax, showFirst, tokenA?.symbol, tokenB?.symbol]);

  return (
    <div className="rounded-3 overflow-hidden">
      <div className="py-3 px-5 flex items-center justify-center flex-col bg-tertiary-bg">
        <div className="text-14 text-secondary-text">{isMax ? "Max" : "Min"} price</div>
        <div className="text-18">{price}</div>
        <div className="text-14 text-secondary-text">
          {showFirst
            ? `${tokenB?.symbol} per ${tokenA?.symbol}`
            : `${tokenA?.symbol} per ${tokenB?.symbol}`}
        </div>
      </div>
      <div className="bg-quaternary-bg py-3 px-5 text-14 border-t-2 border-tertiary-bg text-secondary-text text-center">
        Your position will be 100% {symbol} at this price
      </div>
    </div>
  );
}
