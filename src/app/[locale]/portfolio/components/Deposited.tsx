"use client";

import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { formatUnits } from "viem";

import { SearchInput } from "@/components/atoms/Input";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import Badge from "@/components/badges/Badge";
import { formatFloat } from "@/functions/formatFloat";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import useDeposit from "@/hooks/useDeposit";
import { useTokens } from "@/hooks/useTokenLists";
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/sdk_hybrid/addresses";
import { Token } from "@/sdk_hybrid/entities/token";

const DepositedTokenTableItem = ({ token }: { token: Token }) => {
  const chainId = useCurrentChainId();

  const { currentDeposit, isLoading } = useDeposit({
    amountToCheck: null,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId],
    token,
  });

  return (
    <>
      <div
        className={clsx(
          "h-[56px] flex items-center gap-2 pl-5 rounded-l-3",
          // index % 2 !== 0 && "bg-tertiary-bg",
        )}
      >
        <Image src="/tokens/placeholder.svg" width={24} height={24} alt="" />
        <span>{`${token.name}`}</span>
      </div>
      <div className={clsx("h-[56px] flex items-center")}>
        {isLoading
          ? "Loading..."
          : `${formatFloat(formatUnits(currentDeposit || BigInt(0), token.decimals))} ${token.symbol}`}
      </div>
      <div className={clsx("h-[56px] flex items-center")}>$0.00</div>
      <div className={clsx("h-[56px] flex items-center justify-end pr-8")}>
        <Svg iconName="list" />
      </div>
      <div className={clsx("h-[56px] flex items-center pr-5 rounded-r-3")}>Token owner</div>
    </>
  );
};

export const Deposited = () => {
  const t = useTranslations("Portfolio");
  const [searchValue, setSearchValue] = useState("");

  const loading = false;

  const tokens = useTokens();

  return (
    <>
      <div className="mt-5 flex gap-5">
        <div className="flex items-center justify-between bg-portfolio-margin-positions-gradient rounded-3 px-5 py-6 w-[50%]">
          <div className="flex flex-col ">
            <div className="flex items-center gap-1">
              <span>Deposited to contract</span>
              <Tooltip iconSize={20} text="Info text" />
            </div>
            <span className="text-32 font-medium">$21.44</span>
          </div>
        </div>
      </div>

      <div className="mt-10 flex w-full justify-between">
        <h1 className="text-32 font-medium">{t("deposited_title")}</h1>
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
            Amount <Badge color="green" text="ERC-223" />
          </div>
          <div className="h-[60px] flex items-center">Amount, $</div>
          <div className="h-[60px] flex items-center justify-end pr-6">Details</div>
          <div className="pr-5 h-[60px] flex items-center">Action / Owner</div>

          {!loading &&
            tokens.map((token, index: number) => {
              return <DepositedTokenTableItem key={token.address0} token={token} />;
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
