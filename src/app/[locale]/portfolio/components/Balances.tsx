"use client";

import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { SearchInput } from "@/components/atoms/Input";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import Badge from "@/components/badges/Badge";
import { useTokens } from "@/hooks/useTokenLists";

export const Balances = () => {
  const t = useTranslations("Portfolio");
  const [searchValue, setSearchValue] = useState("");
  const tokens = useTokens();

  const loading = false;

  const currentTableData = tokens.map((token) => ({
    logoURI: token.logoURI,
    name: token.name,
    amountERC20: `0.232 ${token.symbol}`,
    amountERC223: `0.34 ${token.symbol}`,
    amountFiat: "$23.13",
  })) as any[];
  return (
    <>
      <div className="mt-5 flex gap-5">
        <div className="flex flex-col bg-portfolio-balance-gradient rounded-3 px-5 py-6 w-full">
          <div className="flex items-center gap-1">
            <span>Wallet balance</span>
            <Tooltip iconSize={20} text="Info text" />
          </div>

          <span className="text-32 font-medium">$2234.234</span>
        </div>
        <div className="flex flex-col bg-portfolio-margin-positions-gradient rounded-3 px-5 py-6 w-full">
          <div className="flex items-center gap-1">
            <span>Margin positions balance</span>
            <Tooltip iconSize={20} text="Info text" />
          </div>
          <span className="text-32 font-medium">$1234.66</span>
        </div>
      </div>
      <div className="mt-5 flex gap-5">
        <div className="flex flex-col bg-primary-bg rounded-3 px-5 py-6 w-full">
          <div className="flex items-center gap-1">
            <span>Liquidity balance</span>
            <Tooltip iconSize={20} text="Info text" />
          </div>
          <span className="text-24 font-medium">$577.31</span>
          <span className="px-2 py-[2px] bg-quaternary-bg text-14 rounded-1 w-max">
            2 liquidity positions
          </span>
        </div>
        <div className="flex flex-col bg-primary-bg rounded-3 px-5 py-6 w-full">
          <div className="flex items-center gap-1">
            <span>Lending order balance</span>
            <Tooltip iconSize={20} text="Info text" />
          </div>
          <span className="text-24 font-medium">$489.22</span>
          <span className="px-2 py-[2px] bg-quaternary-bg text-14 rounded-1 w-max">
            2 lending orders
          </span>
        </div>
        <div className="flex flex-col bg-primary-bg rounded-3 px-5 py-6 w-full">
          <div className="flex items-center gap-1">
            <span>Deposited to contract</span>
            <Tooltip iconSize={20} text="Info text" />
          </div>
          <span className="text-24 font-medium">$21.44</span>
          <span className="px-2 py-[2px] bg-quaternary-bg text-14 rounded-1 w-max">5 tokens</span>
        </div>
      </div>

      <div className="mt-10 flex w-full justify-between">
        <h1 className="text-32 font-medium">{t("balances_title")}</h1>
        <div className="flex gap-3">
          <SearchInput
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={t("balances_search_placeholder")}
            className="bg-primary-bg w-[480px]"
          />
        </div>
      </div>
      {/*  */}

      <div className="mt-5 min-h-[640px] mb-5 w-full">
        <div className="pr-5 pl-5 grid rounded-5 overflow-hidden bg-table-gradient grid-cols-[minmax(50px,2.67fr),_minmax(87px,1.33fr),_minmax(55px,1.33fr),_minmax(50px,1.33fr),_minmax(50px,1.33fr)] pb-2 relative">
          <div className="pl-5 h-[60px] flex items-center">Token</div>
          <div className="h-[60px] flex items-center gap-2">
            Amount <Badge color="green" text="ERC-20" />
          </div>
          <div className="h-[60px] flex items-center gap-2">
            Amount <Badge color="green" text="ERC-223" />
          </div>
          <div className="h-[60px] flex items-center">Amount, $</div>
          <div className="pr-5 h-[60px] flex items-center justify-end">Details</div>

          {!loading &&
            currentTableData.map((o: any, index: number) => {
              return (
                <>
                  <div
                    className={clsx(
                      "h-[56px] flex items-center gap-2 pl-5 rounded-l-3",
                      index % 2 !== 0 && "bg-tertiary-bg",
                    )}
                  >
                    <Image
                      src={o.logoURI || "/tokens/placeholder.svg"}
                      width={24}
                      height={24}
                      alt=""
                    />
                    <span>{`${o.name}`}</span>
                  </div>
                  <div
                    className={clsx(
                      "h-[56px] flex items-center",
                      index % 2 !== 0 && "bg-tertiary-bg",
                    )}
                  >
                    {o.amountERC20}
                  </div>
                  <div
                    className={clsx(
                      "h-[56px] flex items-center",
                      index % 2 !== 0 && "bg-tertiary-bg",
                    )}
                  >
                    {o.amountERC223}
                  </div>
                  <div
                    className={clsx(
                      "h-[56px] flex items-center",
                      index % 2 !== 0 && "bg-tertiary-bg",
                    )}
                  >
                    {o.amountFiat}
                  </div>
                  <div
                    className={clsx(
                      "h-[56px] flex items-center justify-end pr-5 rounded-r-3",
                      index % 2 !== 0 && "bg-tertiary-bg",
                    )}
                  >
                    <Svg iconName="list" />
                  </div>
                </>
              );
            })}
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-full min-h-[550px]">
            <Preloader type="awaiting" size={48} />
          </div>
        ) : null}
      </div>
    </>
  );
};
