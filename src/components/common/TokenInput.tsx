import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { NumericFormat } from "react-number-format";

import SelectButton from "@/components/atoms/SelectButton";
import Tooltip from "@/components/atoms/Tooltip";
import Badge from "@/components/badges/Badge";
import InputButton from "@/components/buttons/InputButton";
import { clsxMerge } from "@/functions/clsxMerge";
import { Token } from "@/sdk_hybrid/entities/token";
import { Standard } from "@/sdk_hybrid/standard";

function StandardOption({
  balance,
  symbol,
  standard,
  active,
  setIsActive,
  token,
  gas,
}: {
  balance: string | undefined;
  symbol: string | undefined;
  standard: Standard;
  active: Standard;
  setIsActive: (isActive: Standard) => void;
  token: Token | undefined;
  gas?: string;
}) {
  const t = useTranslations("Swap");
  const isActive = useMemo(() => {
    return active === standard;
  }, [active, standard]);

  return (
    <div className="flex flex-col">
      <div
        role="button"
        onClick={() => setIsActive(standard)}
        className={clsxMerge(
          "*:z-10 flex flex-col gap-1 px-3 py-2.5  rounded-2 before:absolute before:rounded-3 before:w-full before:h-full before:left-0 before:top-0 before:duration-200 relative before:bg-standard-gradient hover:cursor-pointer text-12 group",
          isActive ? "before:opacity-100" : "before:opacity-0 hover:before:opacity-100",
          standard === Standard.ERC223 && "before:rotate-180 items-end bg-swap-radio-right",
          standard === Standard.ERC20 && "bg-swap-radio-left",
          !token && "before:opacity-0 hover:before:opacity-0 before:cursor-default cursor-default",
          gas && standard === Standard.ERC20 && "rounded-b-0 before:rounded-b-0",
          gas && standard === Standard.ERC223 && "rounded-b-0 before:rounded-t-0",
        )}
      >
        <div className="flex items-center gap-1 cursor-default">
          <span className={clsxMerge("text-12", !token && "text-tertiary-text")}>
            {t("standard")}
          </span>
          <Badge color="green" text={standard} />
          <Tooltip
            iconSize={16}
            text={standard === Standard.ERC20 ? t("erc20_tooltip") : t("erc223_tooltip")}
          />
        </div>
        {!token ? (
          <div className="text-tertiary-text cursor-default">—</div>
        ) : (
          <span
            className={clsx(
              "block",
              standard === active ? "text-primary-text" : "text-tertiary-text",
            )}
          >
            {t("balance")}{" "}
            <span className="whitespace-nowrap">
              {balance || "0.0"} {symbol}
            </span>
          </span>
        )}
      </div>
      {gas && (
        <div
          className={clsx(
            "py-1 px-3 text-12 bg-swap-gas-gradient flex items-center",
            standard === Standard.ERC20 && "bg-swap-gas-gradient-left rounded-bl-2",
            standard === Standard.ERC223 && "bg-swap-gas-gradient-right rounded-br-2 justify-end",
            gas === "—" ? "text-tertiary-text" : "text-secondary-text",
          )}
        >
          {gas}
        </div>
      )}
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
  readOnly = false,
  isHalf = false,
  isMax = false,
  setHalf,
  setMax,
  gasERC20,
  gasERC223,
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
  readOnly?: boolean;
  isHalf?: boolean;
  isMax?: boolean;
  setHalf?: () => void;
  setMax?: () => void;
  gasERC20?: string;
  gasERC223?: string;
}) {
  const t = useTranslations("Swap");

  return (
    <div className="p-5 bg-secondary-bg rounded-3 relative">
      <div className="flex justify-between items-center mb-5 h-[22px]">
        <span className="text-14 block text-secondary-text">{label}</span>
        {setMax && setHalf && (
          <div className="flex items-center gap-2">
            <InputButton onClick={setHalf} isActive={isHalf} text="Half" />
            <InputButton onClick={setMax} isActive={isMax} text="Max" />
          </div>
        )}
      </div>

      <div className="flex items-center mb-5 justify-between">
        <div>
          <NumericFormat
            inputMode="decimal"
            placeholder="0.0"
            className={clsx(
              "h-12 bg-transparent outline-0 border-0 text-32 w-full peer placeholder:text-tertiary-text",
              readOnly && "pointer-events-none",
            )}
            type="text"
            value={value}
            onValueChange={(values) => {
              onInputChange(values.value);
            }}
            allowNegative={false}
          />
          <span className="text-12 block -mt-1 text-secondary-text">$0.00</span>
          <div className="duration-200 rounded-3 pointer-events-none absolute w-full h-full border border-transparent peer-hover:shadow-checkbox peer-focus:shadow-checkbox peer-focus:border-green top-0 left-0" />
        </div>
        <SelectButton
          className="flex-shrink-0"
          variant="rounded-primary"
          onClick={handleClick}
          size="large"
        >
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
            <span className="whitespace-nowrap text-tertiary-text">{t("select_token")}</span>
          )}
        </SelectButton>
      </div>
      <div className="flex flex-col md:grid md:grid-cols-2 gap-1 md:gap-3 relative">
        <StandardOption
          token={token}
          setIsActive={setStandard}
          active={standard}
          standard={Standard.ERC20}
          symbol={token?.symbol}
          balance={balance0}
          gas={gasERC20}
        />
        <div
          className={clsxMerge(
            "relative mx-auto md:absolute md:left-1/2 md:top-[14px] md:-translate-x-1/2 z-10 text-10 h-[32px] rounded-20 border-green border p-1 flex gap-1 items-center",
            !token && "border-secondary-border",
          )}
        >
          {[Standard.ERC20, Standard.ERC223].map((st) => {
            return (
              <button
                key={st}
                className={clsxMerge(
                  "h-6 rounded-3 duration-200 px-2 min-w-[58px]",
                  standard === st ? "bg-green text-black shadow-checkbox" : "hover:bg-green-bg",
                  !token && st === Standard.ERC20 && "bg-primary-bg shadow-none",
                  !token && "text-tertiary-text pointer-events-none",
                )}
                onClick={() => setStandard(st)}
              >
                {st}
              </button>
            );
          })}
        </div>
        <StandardOption
          token={token}
          setIsActive={setStandard}
          active={standard}
          standard={Standard.ERC223}
          symbol={token?.symbol}
          balance={balance1}
          gas={gasERC223}
        />
      </div>
    </div>
  );
}
