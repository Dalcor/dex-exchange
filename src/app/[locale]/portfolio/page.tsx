"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";

import Container from "@/components/atoms/Container";
import { SearchInput } from "@/components/atoms/Input";
import Popover from "@/components/atoms/Popover";
import SelectButton from "@/components/atoms/SelectButton";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import TabButton from "@/components/buttons/TabButton";
import truncateMiddle from "@/functions/truncateMiddle";
import { useRouter } from "@/navigation";

import { Balances } from "./components/Balances";
import { Deposited } from "./components/Deposited";
import { LendingOrders } from "./components/LendingOrders";
import { LiquidityPositions } from "./components/LiquidityPositions";
import { MarginPositions } from "./components/MarginPositions";

export default function PortfolioPage() {
  const { isConnected, address, connector } = useAccount();
  const router = useRouter();
  const t = useTranslations("Portfolio");
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState(
    "balances" as "balances" | "margin" | "lending" | "positions" | "deposited",
  );

  const trigger = useMemo(
    () => (
      <SelectButton
        className="py-1 xl:py-2 text-14 xl:text-16 w-full md:w-auto flex items-center justify-center"
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex gap-2 items-center">
          <Svg iconName="wallet" />
          {truncateMiddle(address || "", { charsFromStart: 5, charsFromEnd: 3 })}
        </span>
      </SelectButton>
    ),
    [address, isOpen],
  );

  const addresses = [address];

  return (
    <Container>
      <div className="p-10 flex flex-col">
        <div className="flex w-full justify-between">
          <h1 className="text-40 font-medium">{t("title")}</h1>
          <div className="flex gap-3">
            <Popover
              isOpened={isOpen}
              setIsOpened={setIsOpen}
              placement={"bottom-start"}
              trigger={trigger}
            >
              <div className="bg-primary-bg rounded-5 border border-secondary-border shadow-popup p-10">
                hej
              </div>
            </Popover>
            <SearchInput
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={t("search_placeholder")}
              className="bg-primary-bg w-[480px]"
            />
          </div>
        </div>
        <div className="mt-5 flex rounded-3 p-5 bg-primary-bg gap-3">
          <div className="w-10 h-10 m-h-10 m-w-10 bg-red-bg rounded-2"></div>
          {addresses.map((ad) => (
            <div key={ad} className="flex gap-1 p-2 pl-3 bg-tertiary-bg rounded-2">
              <span className="mr-1">
                {truncateMiddle(ad || "", { charsFromStart: 5, charsFromEnd: 3 })}
              </span>{" "}
              <Svg iconName="forward" />
              <Svg iconName="copy" />
            </div>
          ))}
        </div>
        <div className="mt-5 w-full grid grid-cols-5 bg-primary-bg p-1 gap-1 rounded-3">
          <TabButton
            inactiveBackground="bg-secondary-bg"
            size={48}
            active={activeTab === "balances"}
            onClick={() => setActiveTab("balances")}
          >
            Balances
          </TabButton>
          <TabButton
            inactiveBackground="bg-secondary-bg"
            size={48}
            active={activeTab === "margin"}
            onClick={() => setActiveTab("margin")}
          >
            Margin positions
          </TabButton>
          <TabButton
            inactiveBackground="bg-secondary-bg"
            size={48}
            active={activeTab === "lending"}
            onClick={() => setActiveTab("lending")}
          >
            Lending orders
          </TabButton>
          <TabButton
            inactiveBackground="bg-secondary-bg"
            size={48}
            active={activeTab === "positions"}
            onClick={() => setActiveTab("positions")}
          >
            Liquidity positions
          </TabButton>
          <TabButton
            inactiveBackground="bg-secondary-bg"
            size={48}
            active={activeTab === "deposited"}
            onClick={() => setActiveTab("deposited")}
          >
            Deposited to contract
          </TabButton>
        </div>
        {/* Wallet assets */}
        {activeTab === "balances" ? (
          <Balances />
        ) : activeTab === "margin" ? (
          <MarginPositions />
        ) : activeTab === "lending" ? (
          <LendingOrders />
        ) : activeTab === "positions" ? (
          <LiquidityPositions />
        ) : activeTab === "deposited" ? (
          <Deposited />
        ) : null}
      </div>
    </Container>
  );
}
