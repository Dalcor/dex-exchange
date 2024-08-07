"use client";

import React, { useState } from "react";
import { Address, formatUnits } from "viem";

import Container from "@/components/atoms/Container";
import ExternalTextLink from "@/components/atoms/ExternalTextLink";
import { SearchInput } from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import Button, { ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import truncateMiddle from "@/functions/truncateMiddle";
import { Link } from "@/navigation";
import { DexChainId } from "@/sdk_hybrid/chains";
import { ADDRESS_ZERO } from "@/sdk_hybrid/constants";
import { Token } from "@/sdk_hybrid/entities/token";

type AutolistingContract = {
  listingPrice: {
    token: Token;
    amount: bigint;
  }[];
  tokenAmount: number;
  name: string;
  contract: Address;
};

const testData: AutolistingContract[] = [
  {
    listingPrice: [
      {
        amount: BigInt(10000000000000),
        token: new Token(
          DexChainId.SEPOLIA,
          ADDRESS_ZERO,
          ADDRESS_ZERO,
          18,
          "TOT1",
          "Test Token 1",
          "/tokens/placeholder.svg",
        ),
      },
    ],
    tokenAmount: 120,
    name: "Test Autolisting 1",
    contract: ADDRESS_ZERO,
  },
  {
    listingPrice: [],
    tokenAmount: 3320,
    name: "Test Autolisting 1",
    contract: ADDRESS_ZERO,
  },
];
export default function TokenListingPage() {
  const [searchValue, setSearchValue] = useState("");

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

        <div className="pr-5 pl-5 grid rounded-2 overflow-hidden gap-x-2 bg-table-gradient grid-cols-[minmax(50px,2.67fr),_minmax(77px,1.33fr),_minmax(87px,1.33fr),_minmax(55px,1.33fr),_minmax(50px,max-content)] pb-2">
          <div className="h-[60px] flex items-center relative">Contract name</div>
          <div className="h-[60px] flex items-center relative">Token amount</div>
          <div className="h-[60px] flex items-center relative">Listing price</div>
          <div className="h-[60px] flex items-center relative">Contact link</div>
          <div className="h-[60px] flex items-center relative">Action</div>

          {testData.map((o) => {
            return (
              <>
                <div className="h-[56px] flex items-center gap-2">{o.name}</div>

                <div className=" h-[56px] flex items-center">{o.tokenAmount} tokens</div>
                <div className=" h-[56px] flex items-center">
                  {o.listingPrice.length
                    ? o.listingPrice.map((c) => (
                        <span
                          key={c.token.address0}
                          className="flex items-center gap-1 bg-tertiary-bg rounded-2 px-2 py-1"
                        >
                          <span>
                            {formatUnits(c.amount, c.token.decimals)} {c.token.symbol}
                          </span>
                          <Badge variant={BadgeVariant.COLORED} color="green" text="ERC-20" />
                        </span>
                      ))
                    : "Free"}
                </div>
                <div className=" h-[56px] flex items-center">
                  <ExternalTextLink
                    color="white"
                    text={truncateMiddle(o.contract)}
                    href={getExplorerLink(ExplorerLinkType.ADDRESS, o.contract, DexChainId.SEPOLIA)}
                  />
                </div>
                <div className=" h-[56px] flex items-center">
                  <Link href={`/token-listing/contracts/${o.contract}`}>
                    <Button variant={ButtonVariant.OUTLINED} size={ButtonSize.MEDIUM}>
                      List tokens
                    </Button>
                  </Link>
                </div>
              </>
            );
          })}
        </div>
      </Container>
    </>
  );
}
