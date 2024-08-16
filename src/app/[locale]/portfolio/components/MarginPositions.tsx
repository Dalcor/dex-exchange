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
import Button, { ButtonColor } from "@/components/buttons/Button";

export const MarginPositions = () => {
  const t = useTranslations("Portfolio");
  const [searchValue, setSearchValue] = useState("");

  const loading = false;

  const currentTableData = [] as any[];
  return (
    <>
      <div className="mt-5 flex gap-5">
        <div className="flex items-center justify-between bg-portfolio-margin-positions-gradient rounded-3 px-5 py-6 w-[50%]">
          <div className="flex flex-col ">
            <div className="flex items-center gap-1">
              <span>Margin positions balance</span>
              <Tooltip iconSize={20} text="Info text" />
            </div>
            <span className="text-32 font-medium">$1234.66</span>
          </div>
          <Button colorScheme={ButtonColor.LIGHT_GREEN}>Withdraw</Button>
        </div>
      </div>

      <div className="mt-10 flex w-full justify-between">
        <h1 className="text-32 font-medium">{t("margin_title")}</h1>
        <div className="flex gap-3">
          <Button>
            <span className="flex items-center gap-2 w-max">
              Margin positions
              <Svg iconName="forward" />
            </span>
          </Button>

          <SearchInput
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={t("margin_search_placeholder")}
            className="bg-primary-bg w-[480px]"
          />
        </div>
      </div>
      {/*  */}

      <div className="mt-5 min-h-[640px] mb-5 w-full">
        <div className="pr-5 pl-5 grid rounded-5 overflow-hidden bg-table-gradient grid-cols-[minmax(50px,2.67fr),_minmax(87px,1.33fr),_minmax(55px,1.33fr),_minmax(50px,1.33fr),_minmax(50px,1.33fr)] pb-2 relative">
          <div className="pl-5 h-[60px] flex items-center">ID</div>
          <div className="h-[60px] flex items-center">Amount, $</div>
          <div className="h-[60px] flex items-center gap-2">Assets</div>
          <div className="pr-5 h-[60px] flex items-center justify-end">Action / Owner</div>

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
                    <Image src="/tokens/placeholder.svg" width={24} height={24} alt="" />
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
