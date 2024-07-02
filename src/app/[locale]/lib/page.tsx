"use client";
import { useCallback, useEffect, useState } from "react";
import { Address, formatUnits, isAddress, parseUnits } from "viem";
import {
  useAccount,
  useBlockNumber,
  usePublicClient,
  useReadContract,
  useWalletClient,
} from "wagmi";

import Input from "@/components/atoms/Input";
import Popover from "@/components/atoms/Popover";
import Preloader from "@/components/atoms/Preloader";
import SelectButton from "@/components/atoms/SelectButton";
import Button from "@/components/buttons/Button";
import { ERC20_ABI } from "@/config/abis/erc20";
import { ERC223_ABI } from "@/config/abis/erc223";
import { IIFE } from "@/functions/iife";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useTokens } from "@/hooks/useTokenLists";
import addToast from "@/other/toast";

export default function Lib({ params: { locale } }: { params: { locale: string } }) {
  const tokens = useTokens();

  const [isPopoverOpened, setPopoverOpened] = useState(false);

  const [addressToMint, setAddressToMint] = useState<string>("");
  const [amountToMint, setAmountToMint] = useState<string>("");
  const publicClient = usePublicClient();

  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const { address, isConnected, connector } = useAccount();

  const chainId = useCurrentChainId();

  const { data: walletClient } = useWalletClient();

  const { data: decimals } = useReadContract({
    abi: ERC20_ABI,
    functionName: "decimals",
    address: addressToMint! as Address,
    chainId,
    query: {
      enabled: !!addressToMint && isAddress(addressToMint),
    },
  });

  const { data: balance, refetch } = useReadContract({
    abi: ERC20_ABI,
    functionName: "balanceOf",
    address: addressToMint! as Address,
    chainId,
    args: [address as Address],
    query: {
      enabled: !!addressToMint && isAddress(addressToMint),
    },
  });

  const { data: tokenSymbol } = useReadContract({
    abi: ERC20_ABI,
    functionName: "symbol",
    address: addressToMint! as Address,
    chainId,
    query: {
      enabled: !!addressToMint && isAddress(addressToMint),
    },
  });

  const { data: latestBlock } = useBlockNumber({ watch: true });

  useEffect(() => {
    refetch();
  }, [latestBlock, refetch]);

  const handleMint = useCallback(() => {
    console.log(connector);

    if (!address || typeof decimals === "undefined" || !walletClient || !publicClient) {
      addToast("Not correct data", "error");
      return;
    }

    IIFE(async () => {
      setIsLoading(true);

      try {
        const hash = await walletClient.writeContract({
          abi: ERC223_ABI,
          address: addressToMint as Address,
          functionName: "mint",
          args: [address, parseUnits(amountToMint, +decimals)],
        });
        setIsLoading(false);
        setIsPending(true);

        await publicClient.waitForTransactionReceipt({ hash });
        addToast("Minted successfully");
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
        setIsPending(false);
      }
    });
  }, [address, addressToMint, amountToMint, connector, decimals, publicClient, walletClient]);

  return (
    <div className="grid gap-2 mt-4">
      <div className="mx-auto my-[40px] p-3 border border-primary-border rounded-2 bg-primary-bg flex flex-col w-[600px] gap-3">
        <Popover
          customOffset={5}
          isOpened={isPopoverOpened}
          setIsOpened={setPopoverOpened}
          placement="bottom-start"
          trigger={
            <SelectButton
              variant="rectangle-secondary"
              fullWidth
              onClick={() => setPopoverOpened(!isPopoverOpened)}
            >
              {addressToMint || "Select token"}
            </SelectButton>
          }
        >
          <div className="py-1 grid gap-1 bg-primary-bg shadow-popover rounded-3 overflow-hidden w-full">
            {tokens.map((token) => {
              return (
                <div
                  key={token.address0}
                  onClick={() => {
                    setAddressToMint(token.address0);
                    setPopoverOpened(false);
                  }}
                  role="button"
                  className="flex items-center gap-3 bg-primary-bg hover:bg-green-bg duration-300 w-full min-w-[250px] px-10 h-10"
                >
                  {token.symbol}
                </div>
              );
            })}
          </div>
        </Popover>

        <Input
          value={amountToMint}
          onChange={(e) => setAmountToMint(e.target.value)}
          placeholder="Amount"
        />

        <div className="">Decimals: {typeof decimals !== "undefined" ? decimals : "Not found"}</div>
        <div className="">Symbol: {tokenSymbol ? tokenSymbol : "Not found"}</div>
        <div className="">
          Balance:{" "}
          {balance && typeof decimals !== "undefined" ? formatUnits(balance, decimals) : "0"}
        </div>
        {isConnected ? (
          <Button disabled={isLoading || isPending} onClick={handleMint}>
            {isLoading && (
              <span className="flex items-center gap-2">
                <span>Waiting for confirmation</span>
                <Preloader color="black" />
              </span>
            )}
            {isPending && (
              <span className="flex items-center gap-2">
                <span>Minting in progress</span>
                <Preloader color="black" />
              </span>
            )}
            {!isLoading && !isPending && "Mint tokens"}
          </Button>
        ) : (
          <Button disabled>Connect your wallet</Button>
        )}
      </div>
    </div>
  );
}
