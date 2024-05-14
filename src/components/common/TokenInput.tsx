import clsx from "clsx";
import Image from "next/image";
import { useMemo } from "react";
import { NumericFormat } from "react-number-format";

import SelectButton from "@/components/atoms/SelectButton";
import Tooltip from "@/components/atoms/Tooltip";
import Badge from "@/components/badges/Badge";
import { Token } from "@/sdk_hybrid/entities/token";

export enum Standard {
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
        "*:z-10 flex flex-col gap-1 px-3 py-2.5  rounded-2 before:absolute before:rounded-3 before:w-full before:h-full before:left-0 before:top-0 before:duration-200 relative before:bg-standard-gradient hover:cursor-pointer text-12 group",
        isActive ? "before:opacity-100" : "before:opacity-0 hover:before:opacity-100",
        standard === Standard.ERC223 && "before:rotate-180 items-end bg-swap-radio-right",
        standard === Standard.ERC20 && "bg-swap-radio-left",
      )}
    >
      <div className="flex items-center gap-1">
        <span className="text-12">Standard</span>
        <Badge color="green" text={standard} />
        <Tooltip iconSize={16} text={`${standard} Tooltip`} />
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
  balance0,
  balance1,
  label,
  setStandard,
  standard,
}: {
  handleClick: () => void;
  token: Token | undefined;
  value: string;
  onInputChange: (value: string) => void;
  balance0: string | undefined;
  balance1: string | undefined;
  label: string;
  standard: Standard;
  setStandard: (standard: Standard) => void;
}) {
  return (
    <div className="p-5 bg-secondary-bg rounded-3 relative">
      <span className="text-14 block mb-2 text-secondary-text">{label}</span>
      <div className="flex items-center mb-2 justify-between">
        <div>
          <NumericFormat
            inputMode="decimal"
            placeholder="0.0"
            className={clsx("h-12 bg-transparent outline-0 border-0 text-32 w-full peer")}
            type="text"
            value={value}
            onValueChange={(values) => {
              onInputChange(values.value);
            }}
            allowNegative={false}
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
            <span className="whitespace-nowrap text-tertiary-text">Select token</span>
          )}
        </SelectButton>
      </div>
      <div className="flex flex-col md:grid md:grid-cols-2 gap-1 md:gap-3 relative">
        <StandardOption
          setIsActive={setStandard}
          active={standard}
          standard={Standard.ERC20}
          symbol={token?.symbol}
          balance={balance0}
        />
        <div className="relative mx-auto md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-10 text-10 h-[28px] rounded-20 border-green border p-1 flex gap-1 items-center">
          {[Standard.ERC20, Standard.ERC223].map((st) => {
            return (
              <button
                key={st}
                className={clsx(
                  "h-5 rounded-3 duration-200 px-2 min-w-[58px]",
                  standard === st ? "bg-green text-black shadow-checkbox" : "hover:bg-green-bg",
                )}
                onClick={() => setStandard(st)}
              >
                {st}
              </button>
            );
          })}
        </div>
        <StandardOption
          setIsActive={setStandard}
          active={standard}
          standard={Standard.ERC223}
          symbol={token?.symbol}
          balance={balance1}
        />
      </div>
    </div>
  );
}
