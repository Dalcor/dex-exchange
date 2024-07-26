"use client";

import Image from "next/image";
import React from "react";

import Container from "@/components/atoms/Container";
import Button, { ButtonVariant } from "@/components/buttons/Button";

function ListingVariantCard({
  href,
  isExternal,
  image,
  heading,
  paragraphText,
}: {
  href: string;
  isExternal: boolean;
  image: string;
  heading: string;
  paragraphText: string;
}) {
  return (
    <div className="px-5 pb-5 pt-6 bg-primary-bg flex flex-col">
      <div className="flex-grow flex flex-col">
        <Image src={image} alt="" width={320} height={170} className="mb-6" />
        <h3 className="mb-1 text-20 font-bold">{heading}</h3>
        <p className="mb-4 text-secondary-text">{paragraphText}</p>
      </div>

      <a href={href}>
        <Button fullWidth variant={ButtonVariant.OUTLINED} endIcon="forward">
          Apply
        </Button>
      </a>
    </div>
  );
}
export default function SwapPage() {
  return (
    <>
      <Container>
        <div className="py-10">
          <h1 className="mb-3 text-40">Token listing</h1>
          <p className="text-14 text-secondary-text">
            Listing your token on our platform is straightforward. You can choose one of the
            following methods to get your token listed:
          </p>
        </div>
        <div className="grid grid-cols-3 gap-5">
          <ListingVariantCard
            heading="Default listing"
            paragraphText="Get your token added to our default list of tokens easily. Click the button below to apply and join our growing community of supported assets. Our default list ensures maximum visibility and accessibility for your token across our platform, making it easier for users to discover and trade your token. Don’t miss this opportunity to expand your token’s reach!"
            href="#"
            image="/listing-cards/default-listing.png"
            isExternal={false}
          />
          <ListingVariantCard
            heading="Auto-listing contracts"
            paragraphText="List your token automatically using our smart contract. Click the button below to proceed and leverage our seamless, automated process for adding your token to our platform. This method ensures a quick and efficient listing, utilizing the power of smart contracts to handle the process securely and transparently. Get started now to enjoy hassle-free token listing!"
            href="#"
            image="/listing-cards/automatic-listing.png"
            isExternal={false}
          />
          <ListingVariantCard
            heading="Existing token list"
            paragraphText="Add your token to an existing token list effortlessly. You can choose from a variety of reputable token lists available on Uniswap. This option allows your token to be included in established lists, ensuring greater exposure and credibility. Simply select the desired token list, and your token will be showcased to a wide audience of traders and investors. Take advantage of this opportunity to enhance your token's visibility within the crypto community!"
            href="#"
            image="/listing-cards/existing-listing.png"
            isExternal={false}
          />
        </div>
      </Container>
    </>
  );
}
