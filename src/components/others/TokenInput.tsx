import Image from "next/image";

import SelectButton from "@/components/atoms/SelectButton";
import { WrappedToken } from "@/config/types/WrappedToken";

export default function TokenInput({
  handleClick,
  token,
  value,
  onInputChange,
  balance,
}: {
  handleClick: () => void;
  token: WrappedToken | undefined;
  value: string;
  onInputChange: (value: string) => void;
  balance: string | undefined;
}) {
  return (
    <div className="px-5 py-4 bg-secondary-bg rounded-1 border border-primary-border">
      <span className="text-14 block mb-2 text-secondary-text">You pay</span>
      <div className="flex items-center mb-2 justify-between">
        <div>
          <input
            value={value}
            onChange={(e) => onInputChange(e.target.value)}
            className="h-12 bg-transparent outline-0 border-0 text-32 w-full"
            placeholder="0"
            type="text"
          />
        </div>
        <SelectButton variant="rounded-primary" fullWidth onClick={handleClick} size="large">
          {token ? (
            <span className="flex gap-2 items-center pr-2">
              <Image
                className="flex-shrink-0"
                src={token.logoURI}
                alt="Ethereum"
                width={32}
                height={32}
              />
              <span>{token.symbol}</span>
            </span>
          ) : (
            <span>Select token</span>
          )}
        </SelectButton>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-14 block mb-2 text-secondary-text">$3,220.40</span>
        <span className="text-14 block mb-2 text-secondary-text">
          Balance: {balance || "0.0"} {token?.symbol}
        </span>
      </div>
    </div>
  );
}
