"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Address, isAddress } from "viem";
import { usePublicClient, useReadContract, useWalletClient } from "wagmi";

import useListToken from "@/app/[locale]/token-listing/add/hooks/useListToken";
import { useAutoListingContractStore } from "@/app/[locale]/token-listing/add/stores/useAutoListingContractStore";
import { useListTokensStore } from "@/app/[locale]/token-listing/add/stores/useListTokensStore";
import Alert from "@/components/atoms/Alert";
import Container from "@/components/atoms/Container";
import DialogHeader from "@/components/atoms/DialogHeader";
import ExternalTextLink from "@/components/atoms/ExternalTextLink";
import Svg from "@/components/atoms/Svg";
import TextField, { HelperText, InputLabel } from "@/components/atoms/TextField";
import Button from "@/components/buttons/Button";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { ERC20_ABI } from "@/config/abis/erc20";
import { TOKEN_CONVERTER_ABI } from "@/config/abis/tokenConverter";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useTokens } from "@/hooks/useTokenLists";
import { useRouter } from "@/navigation";
import { CONVERTER_ADDRESS } from "@/sdk_hybrid/addresses";
import { Token } from "@/sdk_hybrid/entities/token";

export default function ListTokenPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const chainId = useCurrentChainId();
  console.log(searchParams);

  const { autoListingContract } = useAutoListingContractStore();

  const { tokenA, tokenB, setTokenA, setTokenB } = useListTokensStore();

  const [tokenAAddress, setTokenAAddress] = useState("");
  const [tokenBAddress, setTokenBAddress] = useState("");

  const tokens = useTokens();

  const { handleList } = useListToken();

  const [isPickTokenOpened, setPickTokenOpened] = useState(false);
  const [currentlyPicking, setCurrentlyPicking] = useState<"tokenA" | "tokenB">("tokenA");

  const handleChange = useCallback(
    async (
      e: ChangeEvent<HTMLInputElement>,
      setToken: (token: Token) => void,
      setTokenAddress: (value: string) => void,
    ) => {
      const value = e.target.value;
      setTokenAddress(value);

      if (isAddress(value) && publicClient && chainId) {
        const tokenToFind = tokens.find((t) => t.address0 === value);
        if (tokenToFind) {
          setToken(tokenToFind);
          return;
        }

        const decimals = await publicClient.readContract({
          abi: ERC20_ABI,
          functionName: "decimals",
          address: value,
        });
        const symbol = await publicClient.readContract({
          abi: ERC20_ABI,
          functionName: "symbol",
          address: value,
        });
        const name = await publicClient.readContract({
          abi: ERC20_ABI,
          functionName: "name",
          address: value,
        });
        const predictedERC223Address = await publicClient.readContract({
          abi: TOKEN_CONVERTER_ABI,
          functionName: "predictWrapperAddress",
          address: CONVERTER_ADDRESS[chainId],
          args: [value as Address, true],
        });

        const _token = new Token(
          chainId,
          value,
          predictedERC223Address,
          decimals,
          symbol,
          name,
          "/tokens/placeholder.svg",
        );

        setToken(_token);
      }
    },
    [],
  );

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
                <div>
                  <InputLabel label="Token contract address" />
                  <div className="bg-secondary-bg relative flex items-center border border-transparent rounded-2 pr-[3px]">
                    <input
                      className="bg-transparent peer duration-200 focus:outline-0 h-12 pl-5 placeholder:text-tertiary-text text-16 w-full rounded-2 pr-2"
                      value={tokenAAddress}
                      onChange={(e) => {
                        handleChange(e, setTokenA, setTokenAAddress);
                      }}
                      type="text"
                      placeholder="Token contract address"
                    />
                    <button
                      className="flex-shrink-0 p-2 flex items-center border border-transparent gap-1 text-primary-text bg-primary-bg rounded-2 hover:bg-green-bg hover:border-green duration-200 hover:shadow-checkbox"
                      onClick={() => {
                        setCurrentlyPicking("tokenA");
                        setPickTokenOpened(true);
                      }}
                    >
                      <Image
                        className="mr-1"
                        width={24}
                        height={24}
                        src={tokenA?.logoURI || "/tokens/placeholder.svg"}
                        alt=""
                      />
                      {tokenA?.symbol || "Select token"}
                      <Svg iconName="small-expand-arrow" />
                    </button>
                    <div className="duration-200 rounded-3 pointer-events-none absolute w-full h-full border border-transparent peer-hover:shadow-checkbox peer-focus:shadow-checkbox peer-focus:border-green top-0 left-0" />
                  </div>
                  <HelperText helperText="Enter the contract address of the token you want to list" />
                </div>

                <div>
                  <InputLabel label="Paired token contract address" />
                  <div className="bg-secondary-bg relative flex items-center border border-transparent rounded-2 pr-[3px]">
                    <input
                      className="bg-transparent peer duration-200 focus:outline-0 h-12 pl-5 placeholder:text-tertiary-text text-16 w-full rounded-2 pr-2"
                      value={tokenBAddress}
                      onChange={(e) => {
                        handleChange(e, setTokenB, setTokenBAddress);
                      }}
                      type="text"
                      placeholder="Token contract address"
                    />
                    <button
                      className="flex-shrink-0 p-2 flex items-center border border-transparent gap-1 text-primary-text bg-primary-bg rounded-2 hover:bg-green-bg hover:border-green duration-200 hover:shadow-checkbox"
                      onClick={() => {
                        setCurrentlyPicking("tokenB");
                        setPickTokenOpened(true);
                      }}
                    >
                      <Image
                        className="mr-1"
                        width={24}
                        height={24}
                        src={tokenB?.logoURI || "/tokens/placeholder.svg"}
                        alt=""
                      />
                      {tokenB?.symbol || "Select token"}
                      <Svg iconName="small-expand-arrow" />
                    </button>
                    <div className="duration-200 rounded-3 pointer-events-none absolute w-full h-full border border-transparent peer-hover:shadow-checkbox peer-focus:shadow-checkbox peer-focus:border-green top-0 left-0" />
                  </div>
                  <HelperText helperText="Enter or select the paired token address" />
                </div>

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

              <Button onClick={handleList} fullWidth>
                List token(s)
              </Button>
            </div>
          </div>
        </div>

        <PickTokenDialog
          isOpen={isPickTokenOpened}
          setIsOpen={setPickTokenOpened}
          handlePick={(token) => {
            if (currentlyPicking === "tokenA") {
              setTokenA(token);
              setTokenAAddress(token.address0);
            }
            if (currentlyPicking === "tokenB") {
              setTokenB(token);
              setTokenBAddress(token.address0);
            }

            setPickTokenOpened(false);
          }}
        />
      </Container>
    </>
  );
}
