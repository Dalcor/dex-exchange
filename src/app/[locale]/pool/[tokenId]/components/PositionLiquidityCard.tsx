import Image from "next/image";

import Badge from "@/components/badges/Badge";
import { WrappedToken } from "@/config/types/WrappedToken";

export default function PositionLiquidityCard({
  token,
  amount,
  percentage,
  standards,
}: {
  token: WrappedToken | undefined;
  amount: string;
  percentage?: number | string;
  standards?: string[];
}) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Image src={token?.logoURI || ""} alt={token?.symbol || ""} width={24} height={24} />
        <span className="text-secondary-text">{token?.symbol}</span>
        {standards?.map((standard) => {
          return <Badge key={standard} color="green" text={standard} />;
        })}
      </div>
      <div className="flex items-center gap-1">
        <span>{amount}</span>
        {/* {percentage && <span>({percentage}%)</span>} */}
      </div>
    </div>
  );
}
