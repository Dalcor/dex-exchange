"use client";

import React, { useState } from "react";
import { formatUnits } from "viem";

import useAutoListingContracts from "@/app/[locale]/token-listing/add/hooks/useAutoListingContracts";
import Container from "@/components/atoms/Container";
import ExternalTextLink from "@/components/atoms/ExternalTextLink";
import { SearchInput } from "@/components/atoms/Input";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import Button, { ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import truncateMiddle from "@/functions/truncateMiddle";
import { Link } from "@/navigation";
import { DexChainId } from "@/sdk_hybrid/chains";

export default function TokenListingPage() {
  const [searchValue, setSearchValue] = useState("");

  const autoListings = useAutoListingContracts();

  console.log(autoListings);

  if (!autoListings.data) {
    return <Preloader />;
  }

  return (
    <>
      <Container>
        <div className="my-10">
          <Link href="/token-listing">
            <button className="flex items-center gap-2">
              <Svg iconName="back" />
              Back to token listing
            </button>
          </Link>
        </div>
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

        <div className="grid rounded-2 overflow-hidden bg-table-gradient grid-cols-[minmax(50px,1.33fr),_minmax(77px,1.33fr),_minmax(87px,2.67fr),_minmax(55px,1.33fr),_minmax(50px,max-content)]">
          <div className="contents">
            <div className="pl-5 h-[60px] flex items-center relative">Contract name</div>
            <div className="h-[60px] flex items-center relative">Token amount</div>
            <div className="h-[60px] flex items-center relative">Listing price</div>
            <div className="h-[60px] flex items-center relative">Contact link</div>
            <div className="pr-5 h-[60px] flex items-center relative">Action</div>
          </div>

          {autoListings.data.autoListings.map((o: any) => {
            return (
              <Link
                key={o.id}
                href={`/token-listing/contracts/${o.id}`}
                className="contents hover:bg-green-bg duration-200 group"
              >
                <div className="h-[56px] z-10 relative flex items-center group-hover:bg-green-bg gap-2 pl-5 duration-200 pr-2">
                  {o.name}
                </div>

                <div className=" h-[56px] z-10 relative flex items-center group-hover:bg-green-bg duration-200 pr-2">
                  {o.totalTokens} tokens
                </div>
                <div className=" h-[56px] z-10 relative flex items-center gap-2 group-hover:bg-green-bg duration-200 pr-2">
                  {o.pricesDetail.length
                    ? o.pricesDetail.map((c: any) => (
                        <span
                          key={c.feeTokenAddress.id}
                          className="flex items-center gap-1 bg-tertiary-bg rounded-2 px-2 py-1"
                        >
                          <span>
                            <span className="overflow-hidden ">
                              {+formatUnits(c.price, c.feeTokenAddress.decimals) <= 0
                                ? truncateMiddle(formatUnits(c.price, c.feeTokenAddress.decimals))
                                : formatUnits(c.price, c.feeTokenAddress.decimals)}
                            </span>{" "}
                            {c.feeTokenAddress.symbol}
                          </span>
                          <Badge variant={BadgeVariant.COLORED} color="green" text="ERC-20" />
                        </span>
                      ))
                    : "Free"}
                </div>
                <div className=" h-[56px] z-10 relative flex items-center group-hover:bg-green-bg duration-200 pr-2">
                  <ExternalTextLink
                    onClick={(e) => e.stopPropagation()}
                    color="white"
                    text={truncateMiddle(o.id)}
                    href={getExplorerLink(ExplorerLinkType.ADDRESS, o.id, DexChainId.SEPOLIA)}
                  />
                </div>
                <div className="h-[56px] z-10 relative flex items-center pr-5 group-hover:bg-green-bg duration-200">
                  <Link
                    onClick={(e) => e.stopPropagation()}
                    href={`/token-listing/add/?autoListingContract=${o.id}`}
                  >
                    <Button
                      className="hover:bg-green hover:text-black"
                      variant={ButtonVariant.OUTLINED}
                      size={ButtonSize.MEDIUM}
                    >
                      List tokens
                    </Button>
                  </Link>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </>
  );
}
