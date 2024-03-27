import clsx from "clsx";
import Image from "next/image";
import { useMemo, useState } from "react";

import SelectButton from "@/components/atoms/SelectButton";
import Tooltip from "@/components/atoms/Tooltip";
import Badge from "@/components/badges/Badge";
import { WrappedToken } from "@/config/types/WrappedToken";

enum Standard {
  ERC20 = "ERC-20",
  ERC223 = "ERC-223",
}
function StandardOption({
  balance,
  symbol,
  standard,
  active,
  setIsActive,
}: {
  balance: string | undefined;
  symbol: string | undefined;
  standard: Standard;
  active: Standard;
  setIsActive: (isActive: Standard) => void;
}) {
  const isActive = useMemo(() => {
    return active === standard;
  }, [active, standard]);

  return (
    <div
      role="button"
      onClick={() => setIsActive(standard)}
      className={clsx(
        "*:z-10 flex items-center justify-between px-2 py-1 rounded-2 before:absolute before:rounded-3 before:w-full before:h-full before:left-0 before:top-0 before:duration-200 relative before:bg-standard-gradient hover:cursor-pointer text-12 group",
        isActive ? "before:opacity-100" : "before:opacity-0 hover:before:opacity-100",
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={clsx(
            "rounded-full w-3 h-3 border bg-transparent flex justify-center items-center duration-200",
            isActive
              ? "border-green"
              : "border-secondary-border bg-primary-bg group-hover:border-green",
          )}
        >
          <div className={clsx("w-2 h-2 rounded-full", isActive ? "bg-green" : "bg-transparent")} />
        </div>
        <span>Standard</span>
        <Badge color="green" text={Standard.ERC223} />
        <Tooltip text={`${standard} Tooltip`} />
      </div>
      <span className="block text-secondary-text">
        Balance: {balance || "0.0"} {symbol}
      </span>
    </div>
  );
}
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
  const [active, setActive] = useState<Standard>(Standard.ERC20);

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
        <StandardOption
          setIsActive={setActive}
          active={active}
          standard={Standard.ERC20}
          symbol={token?.symbol}
          balance={balance}
        />
        <StandardOption
          setIsActive={setActive}
          active={active}
          standard={Standard.ERC223}
          symbol={token?.symbol}
          balance={balance}
        />
      </div>
    </div>
  );
}
