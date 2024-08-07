"use client";

import { useSearchParams } from "next/navigation";
import React from "react";

import Alert from "@/components/atoms/Alert";
import Container from "@/components/atoms/Container";
import DialogHeader from "@/components/atoms/DialogHeader";
import ExternalTextLink from "@/components/atoms/ExternalTextLink";
import TextField, { InputLabel } from "@/components/atoms/TextField";
import Button from "@/components/buttons/Button";
import { useRouter } from "@/navigation";
export default function ListTokenPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  console.log(searchParams);

  return (
    <>
      <Container>
        <div className="py-10 flex justify-center">
          <div className="rounded-b-5  bg-primary-bg max-w-[600px]">
            <DialogHeader
              onClose={() => {}}
              title="Listing tokens"
              onBack={() => router.push("/token-listing/contracts")}
            />
            <div className="px-10 pb-10">
              <p className="text-secondary-text text-14 mb-4">
                List your token automatically using our smart contract. Click the button below to
                proceed and leverage our seamless, automated process for adding your token to our
                platform. This method ensures a quick and efficient listing, utilizing the power of
                smart contracts to handle the process securely and transparently. Get started now to
                enjoy hassle-free token listing!
              </p>

              <div className="flex flex-col gap-4">
                <TextField
                  label="Token contract address"
                  helperText="Enter the contract address of the token you want to list"
                />

                <TextField
                  label="Paired token contract address"
                  helperText="Enter or select the paired token address"
                />

                <Alert
                  text="You can only list a token that has a pool on our exchange"
                  type="info"
                />

                <div className="flex flex-col gap-1">
                  <InputLabel label="You list in auto-listing contract" />
                  <div className="flex justify-between px-5 py-4 rounded-3 bg-tertiary-bg items-center">
                    <div className="flex flex-col">
                      <span>AAVE Token List</span>
                      <span>81 tokens</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-secondary-text">Source</span>
                      <ExternalTextLink color="white" text="Tokenlist...eth" href="#" />
                    </div>
                    <div className="flex flex-col">
                      <ExternalTextLink text="View details" href="#" />
                    </div>
                  </div>
                </div>

                <TextField
                  label="Payment for listing"
                  tooltipText="Tooltip for payment for listing"
                />
              </div>

              <Button fullWidth>List token(s)</Button>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
