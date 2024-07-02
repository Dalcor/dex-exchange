"use client";
import React, { useState } from "react";

import BorrowMarketFilter from "@/app/[locale]/borrow-market/components/BorrowMarketFilter";
import BorrowMarketTable from "@/app/[locale]/borrow-market/components/BorrowMarketTable";
import Container from "@/components/atoms/Container";
import SelectButton from "@/components/atoms/SelectButton";
import { InputLabel } from "@/components/atoms/TextField";
import Button, { ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import TabButton from "@/components/buttons/TabButton";

export default function BorrowMarket({}) {
  const [activeTab, setActiveTab] = useState(0);

  const [isDrawerOpened, setDrawerOpened] = useState(false);

  return (
    <Container>
      <div className="py-[40px]">
        <div className="grid grid-cols-[3fr_2fr]">
          <div className="grid grid-cols-3 bg-primary-bg p-1 gap-1 rounded-3">
            {["Borrow market", "My lending orders", "My loan positions"].map((title, index) => {
              return (
                <TabButton
                  key={title}
                  inactiveBackground="bg-secondary-bg"
                  size={48}
                  active={index === activeTab}
                  onClick={() => setActiveTab(index)}
                >
                  {title}
                </TabButton>
              );
            })}
          </div>
          <div className="flex justify-end items-center">
            <Button size={ButtonSize.LARGE} endIcon="add">
              New lending order
            </Button>
          </div>
        </div>
        {activeTab === 0 && (
          <div className="pt-4">
            <div className="grid grid-cols-[1fr_1fr_1fr_117px] gap-2.5 mb-4">
              <div className="flex flex-col gap-1">
                <InputLabel label="Collateral tokens" tooltipText="TooltipText" />
                <SelectButton size="medium" fullWidth>
                  All tokens
                </SelectButton>
              </div>
              <div className="flex flex-col gap-1">
                <InputLabel label="Borrow" tooltipText="TooltipText" />
                <SelectButton size="medium" fullWidth>
                  All tokens
                </SelectButton>
              </div>
              <div className="flex flex-col gap-1">
                <InputLabel label="Tradable tokens" tooltipText="TooltipText" />
                <SelectButton size="medium" fullWidth>
                  All tokens
                </SelectButton>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => setDrawerOpened(true)}
                  variant={ButtonVariant.OUTLINED}
                  endIcon="filter"
                >
                  Filter
                </Button>

                <BorrowMarketFilter
                  isDrawerOpened={isDrawerOpened}
                  setDrawerOpened={setDrawerOpened}
                />
              </div>
            </div>

            <BorrowMarketTable />
          </div>
        )}
        {activeTab === 1 && <div className="">My lending orders</div>}
        {activeTab === 2 && <div className="">My loan positions</div>}
      </div>
    </Container>
  );
}
