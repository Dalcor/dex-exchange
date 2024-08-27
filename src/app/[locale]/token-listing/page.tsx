"use client";

import Image from "next/image";
import React, { ReactNode } from "react";

import Container from "@/components/atoms/Container";
import ExternalTextLink from "@/components/atoms/ExternalTextLink";
import Button, { ButtonVariant } from "@/components/buttons/Button";
import { Link } from "@/navigation";

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
  paragraphText: ReactNode;
}) {
  return (
    <div className="px-5 pb-5 pt-6 bg-primary-bg flex flex-col">
      <div className="flex-grow flex flex-col">
        <Image src={image} alt="" width={320} height={170} className="mb-6 mx-auto" />
        <h3 className="mb-1 text-20 font-bold">{heading}</h3>
        <p className="mb-4 text-secondary-text">{paragraphText}</p>
      </div>

      {isExternal ? (
        <a target="_blank" href={href}>
          <Button fullWidth variant={ButtonVariant.OUTLINED} endIcon="forward">
            Apply
          </Button>
        </a>
      ) : (
        <Link href={href}>
          <Button fullWidth variant={ButtonVariant.OUTLINED} endIcon="next">
            Apply
          </Button>
        </Link>
      )}
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
            paragraphText={
              <>
                You can add your token to the default Dex223 token list. This token list is enabled
                by default in our user interface and therefore all the tokens present in the default
                list are displayed to a user. Note that any user can disable this token list in
                their interface so they can opt out from seeing tokens present in the list.
                <br />
                <br />
                To add a new token to the default token list of Dex223 you can fill in an issue on
                our github. Dex223 team will review the listing application and the response will be
                provided in the corresponding issue comment thread on github.
              </>
            }
            href="/contracts"
            image="/listing-cards/default-listing.png"
            isExternal={true}
          />
          <ListingVariantCard
            heading="Auto-listing contracts"
            paragraphText={
              <>
                You can list a token to any auto-listing contract. Users may enable or disable
                auto-listing contracts in their interface at any time. Your token will be displayed
                to a user if it is present in at least one of the listing contracts or token lists
                currently enabled in the user&quot;s interface. The user will also see a number of
                token lists that your token is present in therefore if your token is present in
                multiple token lists enabled in the user&quot;s interface then your token will gain
                higher trust. Listing contracts may have different listing criteria, some require
                payment to be made and others may be free.
                <br />
                <br />
                You can list a token to an auto-listing contract without interacting with the Dex223
                team as the process is fully automated.
              </>
            }
            href="/token-listing/contracts"
            image="/listing-cards/automatic-listing.png"
            isExternal={false}
          />
          <ListingVariantCard
            heading="Existing token list"
            paragraphText={
              <>
                Tokenlists is a project by Uniswap Labs, visit{" "}
                <a
                  target="_blank"
                  className="text-green hover:underline"
                  href="https://tokenlists.org/"
                >
                  https://tokenlists.org/
                </a>{" "}
                for more info.
                <br />
                <br />
                Tokenlists are maintained by trusted ecosystem entities such as coinmarketcap or
                coingecko. If you can get your token listed to any of the tokenlists then Dex223
                users will be able to see your token in their interface by enabling that tokenlist.
                Note that most token lists only support ERC-20 tokens yet.
              </>
            }
            href="#"
            image="/listing-cards/existing-listing.png"
            isExternal={true}
          />
        </div>
      </Container>
    </>
  );
}
