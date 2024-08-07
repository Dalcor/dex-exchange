"use client";

import Image from "next/image";
import React, { HTMLAttributes, ReactNode, useState } from "react";
import { Address } from "viem";

import Container from "@/components/atoms/Container";
import ExternalTextLink from "@/components/atoms/ExternalTextLink";
import { SearchInput } from "@/components/atoms/Input";
import Tooltip from "@/components/atoms/Tooltip";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import Button from "@/components/buttons/Button";
import IconButton, { IconButtonVariant } from "@/components/buttons/IconButton";
import { clsxMerge } from "@/functions/clsxMerge";
import { copyToClipboard } from "@/functions/copyToClipboard";
import truncateMiddle from "@/functions/truncateMiddle";
import addToast from "@/other/toast";
import { ADDRESS_ZERO } from "@/sdk_hybrid/constants";

function TokenListInfoCard({ title, value }: { title: string; value: ReactNode }) {
  return (
    <div className="bg-tertiary-bg rounded-3 px-5 py-4 flex flex-col">
      <h3 className="text-secondary-text">{title}</h3>
      <span className="text-18">{value}</span>
    </div>
  );
}

function TableRow({ children, className }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsxMerge(
        "grid grid-cols-[minmax(300px,2fr)_minmax(198px,1fr)_minmax(198px,1fr)_100px__minmax(67px,max-content)_minmax(54px,max-content)] pl-5 py-2 pr-2 gap-6 rounded-3 bg-primary-bg",
        className,
      )}
    >
      {children}
    </div>
  );
}
export default function AutoListingContractDetails({
  params,
}: {
  params: {
    address: Address;
  };
}) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <>
      <Container>
        <div className="py-10 px-6">
          <div className="flex justify-between mb-5">
            <h1 className="text-40">Token listing</h1>
            <Button>List token(s)</Button>
          </div>
          <div className="bg-primary-bg rounded-5 grid grid-cols-6 p-10 gap-3 mb-10">
            <div className="flex flex-col justify-center">
              <h3 className="text-20 font-medium">AAVE Token List</h3>
              <p>81 tokens</p>
            </div>
            <TokenListInfoCard title="Chain" value="Ethereum" />
            <TokenListInfoCard
              title="Source"
              value={
                <span className="flex items-center">
                  <ExternalTextLink
                    color="white"
                    text={truncateMiddle(params.address, { charsFromEnd: 3, charsFromStart: 3 })}
                    href="#"
                  />{" "}
                  <IconButton
                    variant={IconButtonVariant.COPY}
                    handleCopy={() => copyToClipboard(params.address)}
                  />{" "}
                </span>
              }
            />
            <TokenListInfoCard title="Last updated" value="2 years ago" />
            <TokenListInfoCard title="Version" value="145.0.0" />
            <TokenListInfoCard title="Listing type" value="Free" />
          </div>
          <div className="mb-5">
            <h1 className="text-40">Listing price</h1>
          </div>
          <div className="px-5 pb-5 pt-3 bg-primary-bg rounded-5 mb-10">
            <div className="flex items-center gap-1 mb-3">
              <h3 className="text-secondary-text ">11 tokens available to pay for listing</h3>
              <Tooltip text="Avalialbe tooltip" />
            </div>
            <div className="grid grid-cols-4 gap-x-2 gap-y-3">
              {[...Array(5)].map((v, index) => {
                return (
                  <div
                    key={index}
                    className="bg-tertiary-bg grid grid-cols-[1fr_91px_68px] gap-2 py-2 pr-2 pl-3 rounded-3"
                  >
                    <div className="flex items-center">122.32</div>

                    <div className="rounded-2 bg-secondary-bg py-1 flex items-center justify-center">
                      USDT
                    </div>
                    <div className="flex items-center">
                      <Badge variant={BadgeVariant.COLORED} color="green" text="ERC-223" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="pb-10">
              <div className="flex justify-between mb-20">
                <h1 className="mb-3 text-40 font-medium">Auto-listing contracts</h1>
                <div className="w-[480px]">
                  <SearchInput
                    className="bg-tertiary-bg"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search name or pastre contract"
                  />
                </div>
              </div>
            </div>
            <div className="grid px-5 py-[18px] bg-tertiary-bg rounded-t-5">
              <TableRow className="bg-tertiary-bg">
                <div>Name</div>
                <div className="flex items-center gap-2">
                  Address <Badge variant={BadgeVariant.COLORED} color="green" text="ERC-20" />
                </div>
                <div className="flex items-center gap-2">
                  Address <Badge variant={BadgeVariant.COLORED} color="green" text="ERC-223" />
                </div>
                <div>Tags</div>
                <div>Found in</div>
                <div>Details</div>
              </TableRow>
            </div>

            <div className="bg-primary-bg rounded-b-5 py-2.5 px-5">
              {[...Array(15)].map((v, index) => {
                return (
                  <TableRow key={index} className={index % 2 !== 0 ? "bg-tertiary-bg" : ""}>
                    <div className="flex items-center gap-2">
                      <Image width={24} height={24} src="/tokens/placeholder.svg" alt="" />
                      <span className="font-medium">AAVE Token</span>
                      <span className="text-secondary-text">AAVE</span>
                    </div>
                    <div className="flex items-center">
                      <ExternalTextLink
                        color="white"
                        text={truncateMiddle(ADDRESS_ZERO)}
                        href="#"
                      />{" "}
                      <IconButton
                        variant={IconButtonVariant.COPY}
                        handleCopy={() => addToast("Copied!")}
                      />
                    </div>
                    <div className="flex items-center">
                      <ExternalTextLink
                        color="white"
                        text={truncateMiddle(ADDRESS_ZERO)}
                        href="#"
                      />{" "}
                      <IconButton
                        variant={IconButtonVariant.COPY}
                        handleCopy={() => addToast("Copied!")}
                      />
                    </div>
                    <div className="flex items-center"></div>
                    <div className="flex items-center">1 list</div>
                    <div className="flex items-center justify-end">
                      {" "}
                      <Tooltip
                        text={"Token details"}
                        renderTrigger={(ref, refProps) => {
                          return (
                            <div
                              ref={ref.setReference}
                              {...refProps}
                              className="w-10 h-10 flex items-center justify-center"
                            >
                              <IconButton iconName="details" onClick={() => null} />
                            </div>
                          );
                        }}
                      />
                    </div>
                  </TableRow>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
