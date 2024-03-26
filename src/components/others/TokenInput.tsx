import Image from "next/image";

import SelectButton from "@/components/atoms/SelectButton";
import Tooltip from "@/components/atoms/Tooltip";
import Badge from "@/components/badges/Badge";
import { WrappedToken } from "@/config/types/WrappedToken";

export default function TokenInput({
  handleClick,
  token,
  value,
  onInputChange,
  balance,
  label,
}: {
  handleClick: () => void;
  token: WrappedToken | undefined;
  value: string;
  onInputChange: (value: string) => void;
  balance: string | undefined;
  label: string;
}) {
  return (
    <div className="p-5 bg-secondary-bg rounded-3 relative">
      <span className="text-14 block mb-2 text-secondary-text">{label}</span>
      <div className="flex items-center mb-2 justify-between">
        <div>
          <input
            value={value}
            onChange={(e) => onInputChange(e.target.value)}
            className="h-12 bg-transparent outline-0 border-0 text-32 w-full peer"
            placeholder="0"
            type="text"
          />
          <span className="text-12 block -mt-1 text-secondary-text">$3,220.40</span>
          <div className="duration-200 rounded-3 pointer-events-none absolute w-full h-full border border-transparent peer-hover:shadow-checkbox peer-focus:shadow-checkbox peer-focus:border-green top-0 left-0" />
        </div>
        <SelectButton variant="rounded-primary" onClick={handleClick} size="large">
          {token ? (
            <span className="flex gap-2 items-center pr-2">
              <Image
                className="flex-shrink-0"
                src={token?.logoURI || ""}
                alt="Ethereum"
                width={32}
                height={32}
              />
              <span>{token.symbol}</span>
            </span>
          ) : (
            <span className="whitespace-nowrap text-placeholder-text">Select token</span>
          )}
        </SelectButton>
      </div>
      <div className="grid gap-1">
        <div
          className="*:z-10 flex items-center justify-between px-2 py-1 rounded-2 before:opacity-0
           before:absolute before:rounded-3 before:w-full before:h-full before:left-0 before:top-0 before:duration-200 relative
            before:bg-standard-gradient hover:before:opacity-100 hover:cursor-pointer text-12"
        >
          <div className="flex items-center gap-2">
            <div className="rounded-full w-4 h-4 bg-green" />
            <span>Standard</span>
            <Badge color="green" text="ERC-20" />
            <Tooltip text="ERC-20 Tooltip" />
          </div>
          <span className="block text-secondary-text">
            Balance: {balance || "0.0"} {token?.symbol}
          </span>
        </div>
        <div
          className="*:z-10 flex items-center justify-between px-2 py-1 rounded-2 before:opacity-0
           before:absolute before:rounded-3 before:w-full before:h-full before:left-0 before:top-0 before:duration-200 relative
            before:bg-standard-gradient hover:before:opacity-100 hover:cursor-pointe text-12"
        >
          <div className="flex items-center gap-2">
            <div className="rounded-full w-4 h-4 bg-green" />
            <span>Standard</span>
            <Badge color="green" text="ERC-223" />
            <Tooltip text="ERC-223 Tooltip" />
          </div>
          <span className="text-secondary-text">
            Balance: {balance || "0.0"} {token?.symbol}
          </span>
        </div>
      </div>
    </div>
  );
}
