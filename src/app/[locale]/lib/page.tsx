"use client";
import { useTranslations } from "next-intl";
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
import Preloader from "@/components/atoms/Preloader";
import Button from "@/components/buttons/Button";
import { ERC20_ABI } from "@/config/abis/erc20";
import { ERC223_ABI } from "@/config/abis/erc223";
import { networks } from "@/config/networks";
import { IIFE } from "@/functions/iife";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import addToast from "@/other/toast";
import { DexChainId } from "@/sdk_hybrid/chains";

export default function Lib({ params: { locale } }: { params: { locale: string } }) {
  const [isDialogOpened, setDialogOpened] = useState(false);
  const [isCheckboxChecked, setCheckboxChecked] = useState(false);
  const [isSwitchOn, setSwitchOn] = useState(false);

  const t = useTranslations("Trade");

  const [addressToMint, setAddressToMint] = useState<string>("");
  const [amountToMint, setAmountToMint] = useState<string>("");
  const publicClient = usePublicClient();

  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const { address } = useAccount();

  const { data: walletClient } = useWalletClient();

  const chainId = useCurrentChainId();

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
  }, [address, addressToMint, amountToMint, decimals, publicClient, walletClient]);

  return (
    <div className="grid gap-2 mt-4">
      {/*{t("trade")}*/}
      {/*<div className="p-3 border border-primary-border">*/}
      {/*  <h2 className="mb-3 border-b border-primary-border pb-3">Buttons</h2>*/}
      {/*  <div className="inline-flex gap-1">*/}
      {/*    <Button>Just button</Button>*/}
      {/*    <Button onClick={() => setDialogOpened(true)} variant={ButtonVariant.OUTLINED}>*/}
      {/*      Open Dialog*/}
      {/*    </Button>*/}
      {/*  </div>*/}

      {/*  <div className="inline-flex gap-1 ml-7">*/}
      {/*    <Button size={ButtonSize.MEDIUM}>Regular contained button</Button>*/}
      {/*    <Button size={ButtonSize.MEDIUM} variant={ButtonVariant.OUTLINED}>*/}
      {/*      Regular outline button*/}
      {/*    </Button>*/}
      {/*  </div>*/}

      {/*  <div className="inline-flex gap-1 ml-7">*/}
      {/*    <Button size={ButtonSize.SMALL}>Small contained button</Button>*/}
      {/*    <Button size={ButtonSize.SMALL} variant={ButtonVariant.OUTLINED}>*/}
      {/*      Small outline button*/}
      {/*    </Button>*/}
      {/*  </div>*/}

      {/*  <Dialog isOpen={isDialogOpened} setIsOpen={setDialogOpened}>*/}
      {/*    <h2>Test dialog</h2>*/}
      {/*    <button onClick={() => setDialogOpened(false)}>Close dialog</button>*/}
      {/*  </Dialog>*/}
      {/*</div>*/}

      {/*<div className="p-3 border border-primary-border">*/}
      {/*  <h2 className="mb-3 border-b border-primary-border pb-3">Checkbox/Radio</h2>*/}
      {/*  <div className="inline-flex gap-3">*/}
      {/*    <Checkbox*/}
      {/*      checked={isCheckboxChecked}*/}
      {/*      id="test"*/}
      {/*      label="This is checkbox"*/}
      {/*      handleChange={() => {*/}
      {/*        setCheckboxChecked(!isCheckboxChecked);*/}
      {/*      }}*/}
      {/*    />*/}

      {/*    <Switch checked={isSwitchOn} handleChange={() => setSwitchOn(!isSwitchOn)} />*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/*<div className="p-3 border border-primary-border">*/}
      {/*  <h2 className="mb-3 border-b border-primary-border pb-3">Input Fields</h2>*/}
      {/*  <div className="inline-flex gap-3">*/}
      {/*    <TextField*/}
      {/*      label="Text field"*/}
      {/*      placeholder="Check it out"*/}
      {/*      helperText="This is helper text"*/}
      {/*    />*/}
      {/*    <TextField*/}
      {/*      label="Error text field"*/}
      {/*      placeholder="Check it out"*/}
      {/*      error="Something is wrong"*/}
      {/*    />*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/*<div className="p-3 border border-primary-border">*/}
      {/*  <h2 className="mb-3 border-b border-primary-border pb-3">Awaiting loaders</h2>*/}
      {/*  <div className="inline-flex gap-3 py-3">*/}
      {/*    <Preloader type="awaiting" size={30} />*/}
      {/*    <Preloader type="awaiting" />*/}
      {/*    <Preloader type="awaiting" size={70} />*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/*<div className="p-3 border border-primary-border">*/}
      {/*  <h2 className="mb-3 border-b border-primary-border pb-3">Icon Buttons</h2>*/}
      {/*  <div className="inline-flex gap-3 py-3 items-center">*/}
      {/*    <IconButton variant={IconButtonVariant.DEFAULT} iconName="add" />*/}
      {/*    <IconButton*/}
      {/*      variant={IconButtonVariant.CONTROL}*/}
      {/*      iconName="zoom-in"*/}
      {/*      iconSize={IconSize.SMALL}*/}
      {/*    />*/}
      {/*    <IconButton variant={IconButtonVariant.CLOSE} handleClose={() => null} />*/}
      {/*    <IconButton*/}
      {/*      variant={IconButtonVariant.DELETE}*/}
      {/*      handleDelete={() => null}*/}
      {/*      iconSize={IconSize.SMALL}*/}
      {/*    />*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/*<div className="p-3 border border-primary-border">*/}
      {/*  <h2 className="mb-3 border-b border-primary-border pb-3">Toasts</h2>*/}
      {/*  <div className="inline-flex gap-3 py-3 items-center">*/}
      {/*    <Button*/}
      {/*      size={ButtonSize.SMALL}*/}
      {/*      variant={ButtonVariant.OUTLINED}*/}
      {/*      onClick={() => {*/}
      {/*        addToast("This is success Toast");*/}
      {/*      }}*/}
      {/*    >*/}
      {/*      Success*/}
      {/*    </Button>*/}

      {/*    <Button*/}
      {/*      size={ButtonSize.SMALL}*/}
      {/*      variant={ButtonVariant.OUTLINED}*/}
      {/*      onClick={() => {*/}
      {/*        addToast("This is info Toast", "info");*/}
      {/*      }}*/}
      {/*    >*/}
      {/*      Info*/}
      {/*    </Button>*/}

      {/*    <Button*/}
      {/*      size={ButtonSize.SMALL}*/}
      {/*      variant={ButtonVariant.OUTLINED}*/}
      {/*      onClick={() => {*/}
      {/*        addToast("This is warning Toast", "warning");*/}
      {/*      }}*/}
      {/*    >*/}
      {/*      Warning*/}
      {/*    </Button>*/}

      {/*    <Button*/}
      {/*      size={ButtonSize.SMALL}*/}
      {/*      variant={ButtonVariant.OUTLINED}*/}
      {/*      onClick={() => {*/}
      {/*        addToast("This is error Toast", "error");*/}
      {/*      }}*/}
      {/*    >*/}
      {/*      Error*/}
      {/*    </Button>*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/*<div className="p-3 border border-primary-border">*/}
      {/*  <h2 className="mb-3 border-b border-primary-border pb-3">Pool labels</h2>*/}
      {/*  <div className="inline-flex gap-3 py-3 items-center">*/}
      {/*    <RangeBadge status={PositionRangeStatus.IN_RANGE} />*/}
      {/*    <RangeBadge status={PositionRangeStatus.OUT_OF_RANGE} />*/}
      {/*    <RangeBadge status={PositionRangeStatus.CLOSED} />*/}
      {/*    <span>|</span>*/}
      {/*    <div className="flex gap-3 items-center">*/}
      {/*      <Badge color="blue" text="Custom" />*/}
      {/*      <Badge color="red" text="Risky" />*/}
      {/*      <Badge variant={BadgeVariant.PERCENTAGE} percentage={67} />*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}

      <div className="mx-auto my-[80px] p-3 border border-primary-border rounded-2 bg-primary-bg flex flex-col w-[600px] gap-3">
        <Input
          value={addressToMint}
          onChange={(e) => setAddressToMint(e.target.value)}
          placeholder="Address"
        />
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
      </div>
    </div>
  );
}
