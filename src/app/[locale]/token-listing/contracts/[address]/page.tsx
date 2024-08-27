"use client";

import Image from "next/image";
import React, { HTMLAttributes, ReactNode, useState } from "react";
import { Address, formatUnits } from "viem";

import { useAutoListingContract } from "@/app/[locale]/token-listing/add/hooks/useAutoListingContracts";
import Container from "@/components/atoms/Container";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import ExternalTextLink from "@/components/atoms/ExternalTextLink";
import { SearchInput } from "@/components/atoms/Input";
import Tooltip from "@/components/atoms/Tooltip";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import Button from "@/components/buttons/Button";
import IconButton, { IconButtonVariant } from "@/components/buttons/IconButton";
import { clsxMerge } from "@/functions/clsxMerge";
import { copyToClipboard } from "@/functions/copyToClipboard";
import { formatFloat } from "@/functions/formatFloat";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import truncateMiddle from "@/functions/truncateMiddle";
import { Link } from "@/navigation";
import addToast from "@/other/toast";
import { DexChainId } from "@/sdk_hybrid/chains";

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

  const listingContract = useAutoListingContract(params.address);

  if (!listingContract) {
    return <div>Whoops, this autolisting not found.</div>;
  }

  console.log(listingContract);

  return (
    <>
      <Container>
        <div className="py-10 px-6">
          <div className="flex justify-between mb-5">
            <h1 className="text-40">Token listing</h1>
            <Link href={`/token-listing/add/?autoListingContract=${params.address}`}>
              <Button>List token(s)</Button>
            </Link>
          </div>
          <div className="bg-primary-bg rounded-5 grid grid-cols-6 p-10 gap-3 mb-10">
            <div className="flex flex-col justify-center">
              <h3 className="text-20 font-medium">{listingContract.name}</h3>
              <p>{listingContract.totalTokens} tokens</p>
            </div>
            <TokenListInfoCard title="Chain" value="Sepolia" />
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
            <TokenListInfoCard
              title="Last updated"
              value={new Date(listingContract.lastUpdated * 1000).toLocaleString("en-us", {
                month: "short",
                year: "numeric",
                day: "numeric",
              })}
            />
            <TokenListInfoCard title="Version" value="145.0.0" />
            <TokenListInfoCard
              title="Listing type"
              value={!!listingContract.pricesDetail.length ? "Paid" : "Free"}
            />
          </div>
          <div className="mb-5">
            <h1 className="text-40">Listing price</h1>
          </div>
          {listingContract.pricesDetail.length && (
            <div className="px-5 pb-5 pt-3 bg-primary-bg rounded-5 mb-10">
              <div className="flex items-center gap-1 mb-3">
                <h3 className="text-secondary-text ">
                  {listingContract.pricesDetail.length} tokens available to pay for listing
                </h3>
                <Tooltip text="Avalialbe tooltip" />
              </div>
              <div className="grid grid-cols-[minmax(284px,1fr)_minmax(284px,1fr)_minmax(284px,1fr)_minmax(284px,1fr)] gap-x-2 gap-y-3">
                {listingContract.pricesDetail.map((v: any, index: number) => {
                  return (
                    <div
                      key={index}
                      className="bg-tertiary-bg grid grid-cols-[1fr_91px_68px] gap-2 py-2 pr-2 pl-3 rounded-3"
                    >
                      <div className="flex items-center">
                        {formatUnits(v.price, v.feeTokenAddress.decimals).slice(0, 7) === "0.00000"
                          ? truncateMiddle(formatUnits(v.price, v.feeTokenAddress.decimals), {
                              charsFromStart: 4,
                              charsFromEnd: 3,
                            })
                          : formatFloat(formatUnits(v.price, v.feeTokenAddress.decimals))}
                      </div>

                      <div className="rounded-2 bg-secondary-bg py-1 flex items-center justify-center">
                        {v.feeTokenAddress.symbol}
                      </div>
                      <div className="flex items-center">
                        <Badge variant={BadgeVariant.COLORED} color="green" text="ERC-223" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div>
              <div className="flex justify-between mb-5">
                <h1 className="mb-3 text-40 font-medium">Tokens</h1>
                {!!listingContract.tokens.length && (
                  <div className="w-[480px]">
                    <SearchInput
                      className="bg-tertiary-bg"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Search name or pastre contract"
                    />
                  </div>
                )}
              </div>
            </div>
            {!!listingContract.tokens.length ? (
              <>
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
                  {listingContract.tokens.map(({ token }: any, index: number) => {
                    return (
                      <TableRow key={index} className={index % 2 !== 0 ? "bg-tertiary-bg" : ""}>
                        <div className="flex items-center gap-2">
                          <Image width={24} height={24} src="/tokens/placeholder.svg" alt="" />
                          <span className="font-medium">{token.name}</span>
                          <span className="text-secondary-text">{token.symbol}</span>
                        </div>
                        <div className="flex items-center">
                          <ExternalTextLink
                            color="white"
                            text={truncateMiddle(token.addressERC20)}
                            href={getExplorerLink(
                              ExplorerLinkType.ADDRESS,
                              token.addressERC20,
                              DexChainId.SEPOLIA,
                            )}
                          />{" "}
                          <IconButton
                            variant={IconButtonVariant.COPY}
                            handleCopy={() => {
                              copyToClipboard(token.addressERC20);
                              addToast("Copied!");
                            }}
                          />
                        </div>
                        <div className="flex items-center">
                          <ExternalTextLink
                            color="white"
                            text={truncateMiddle(token.addressERC223)}
                            href={getExplorerLink(
                              ExplorerLinkType.ADDRESS,
                              token.addressERC223,
                              DexChainId.SEPOLIA,
                            )}
                          />{" "}
                          <IconButton
                            variant={IconButtonVariant.COPY}
                            handleCopy={() => {
                              copyToClipboard(token.addressERC223);
                              addToast("Copied!");
                            }}
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
              </>
            ) : (
              <div className="flex items-center justify-center min-h-[340px] bg-primary-bg flex-col gap-2 rounded-5">
                <EmptyStateIcon iconName="tokens" />
                <span className="text-secondary-text">No listed tokens yet</span>
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
