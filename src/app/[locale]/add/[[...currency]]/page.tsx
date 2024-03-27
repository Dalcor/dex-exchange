"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { parseUnits } from "viem";

import FeeAmountSettings from "@/app/[locale]/add/[[...currency]]/components/FeeAmountSettings";
import { useAddLiquidityTokensStore } from "@/app/[locale]/add/[[...currency]]/stores/useAddLiquidityTokensStore";
import { useLiquidityTierStore } from "@/app/[locale]/add/[[...currency]]/stores/useLiquidityTierStore";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import SelectButton from "@/components/atoms/SelectButton";
import SystemIconButton from "@/components/buttons/SystemIconButton";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import { FEE_TIERS } from "@/config/constants/liquidityFee";
import { nonFungiblePositionManagerAddress } from "@/config/contracts";
import { WrappedToken } from "@/config/types/WrappedToken";
import useAllowance from "@/hooks/useAllowance";
import useDeposit from "@/hooks/useDeposit";
import { useTokens } from "@/hooks/useTokenLists";
import { useRouter } from "@/navigation";

import { DepositAmounts } from "./components/DepositAmounts/DepositAmounts";
import { PriceRange } from "./components/PriceRange/PriceRange";

export default function AddPoolPage({
  params,
}: {
  params: {
    currency: [string, string, string];
  };
}) {
  const [isOpenedTokenPick, setIsOpenedTokenPick] = useState(false);
  const router = useRouter();

  const currency = params.currency;

  const { tokenA, tokenB, setTokenA, setTokenB } = useAddLiquidityTokensStore();
  const { setTier } = useLiquidityTierStore();

  const tokens = useTokens();

  const { setIsOpen } = useTransactionSettingsDialogStore();

  const [currentlyPicking, setCurrentlyPicking] = useState<"tokenA" | "tokenB">("tokenA");

  const handlePick = useCallback(
    (token: WrappedToken) => {
      if (currentlyPicking === "tokenA") {
        setTokenA(token);
      }

      if (currentlyPicking === "tokenB") {
        setTokenB(token);
      }

      setIsOpenedTokenPick(false);
    },
    [currentlyPicking, setTokenA, setTokenB],
  );

  useEffect(() => {
    if (currency?.[0]) {
      const token = tokens.find((t) => t.address === currency[0]);
      if (token) {
        setTokenA(token);
      }
    }

    if (currency?.[1]) {
      const token = tokens.find((t) => t.address === currency[1]);
      if (token) {
        setTokenB(token);
      }
    }

    if (currency?.[2]) {
      if (FEE_TIERS.includes(Number(currency[2]))) {
        setTier(Number(currency[2]));
      }
    }
  }, [currency, setTier, setTokenA, setTokenB, tokens]);

  const {
    isAllowed: isAllowedA,
    writeTokenApprove: approveA,
    isApproving: isApprovingA,
    currentAllowance: currentAllowanceA,
  } = useAllowance({
    token: tokenA,
    contractAddress: nonFungiblePositionManagerAddress,
    amountToCheck: parseUnits("2", tokenA?.decimals || 18),
  });

  const {
    isAllowed: isAllowedB,
    writeTokenApprove: approveB,
    isApproving: isApprovingB,
    currentAllowance: currentAllowanceB,
  } = useAllowance({
    token: tokenB,
    contractAddress: nonFungiblePositionManagerAddress,
    amountToCheck: parseUnits("2", tokenB?.decimals || 18),
  });

  const {
    isDeposited: isDepositedA,
    writeTokenDeposit: depositA,
    isDepositing: isDepositingA,
    currentDeposit: currentDepositA,
  } = useDeposit({
    token: tokenA,
    contractAddress: nonFungiblePositionManagerAddress,
    amountToCheck: parseUnits("2", tokenA?.decimals || 18),
  });
  const {
    isDeposited: isDepositedB,
    writeTokenDeposit: depositB,
    isDepositing: isDepositingB,
    currentDeposit: currentDepositB,
  } = useDeposit({
    token: tokenB,
    contractAddress: nonFungiblePositionManagerAddress,
    amountToCheck: parseUnits("50", tokenB?.decimals || 18),
  });

  return (
    <Container>
      <div className="w-[1200px] bg-primary-bg mx-auto my-[80px]">
        <div className="flex justify-between items-center rounded-t-2 border py-2.5 px-6 border-secondary-border">
          <SystemIconButton
            iconSize={32}
            iconName="back"
            size="large"
            onClick={() => router.push("/pools")}
          />
          <h2 className="text-20 font-bold">Add Liquidity</h2>
          <SystemIconButton
            iconSize={32}
            size="large"
            iconName="settings"
            onClick={() => setIsOpen(true)}
          />
        </div>
        <div className="rounded-b-2 border border-secondary-border border-t-0 p-10 bg-primary-bg">
          <h3 className="text-16 font-bold mb-4">Select pair</h3>
          <div className="flex gap-3 mb-5">
            <SelectButton
              variant="rounded-secondary"
              fullWidth
              onClick={() => {
                setCurrentlyPicking("tokenA");
                setIsOpenedTokenPick(true);
              }}
              size="large"
            >
              {tokenA ? (
                <span className="flex gap-2 items-center">
                  <Image
                    className="flex-shrink-0"
                    src={tokenA?.logoURI || ""}
                    alt="Ethereum"
                    width={32}
                    height={32}
                  />
                  <span className="block overflow-ellipsis whitespace-nowrap w-[141px] overflow-hidden text-left">
                    {tokenA.symbol}
                  </span>
                </span>
              ) : (
                <span>Select token</span>
              )}
            </SelectButton>
            <SelectButton
              variant="rounded-secondary"
              fullWidth
              onClick={() => {
                setCurrentlyPicking("tokenB");
                setIsOpenedTokenPick(true);
              }}
              size="large"
            >
              {tokenB ? (
                <span className="flex gap-2 items-center">
                  <Image
                    className="flex-shrink-0"
                    src={tokenB?.logoURI || ""}
                    alt="Ethereum"
                    width={32}
                    height={32}
                  />
                  <span className="block overflow-ellipsis whitespace-nowrap w-[141px] overflow-hidden text-left">
                    {tokenB.symbol}
                  </span>
                </span>
              ) : (
                <span>Select token</span>
              )}
            </SelectButton>
          </div>
          <FeeAmountSettings />
          <div className="grid gap-5 grid-cols-2">
            <DepositAmounts
              currentAllowanceA={currentAllowanceA}
              currentAllowanceB={currentAllowanceB}
              currentDepositA={currentDepositA}
              currentDepositB={currentDepositB}
            />
            <PriceRange />
          </div>

          <div className="grid gap-2 mb-5 grid-cols-2">
            {!isAllowedA && (
              <Button variant="outline" fullWidth onClick={() => approveA()}>
                {isApprovingA ? "Loading..." : <span>Approve {tokenA?.symbol}</span>}
              </Button>
            )}
            {!isAllowedB && (
              <Button variant="outline" fullWidth onClick={() => approveB()}>
                {isApprovingB ? "Loading..." : <span>Approve {tokenB?.symbol}</span>}
              </Button>
            )}
          </div>
          <div className="grid gap-2 mb-5 grid-cols-2">
            {!isDepositedA && (
              <Button variant="outline" fullWidth onClick={() => depositA()}>
                {isDepositingA ? "Loading..." : <span>Deposit {tokenA?.symbol}</span>}
              </Button>
            )}
            {!isDepositedB && (
              <Button variant="outline" fullWidth onClick={() => depositB()}>
                {isDepositingB ? "Loading..." : <span>Deposit {tokenB?.symbol}</span>}
              </Button>
            )}
          </div>

          {/* <Button onClick={handleAddLiquidity} fullWidth>
            Add liquidity
          </Button> */}
        </div>
        <PickTokenDialog
          handlePick={handlePick}
          isOpen={isOpenedTokenPick}
          setIsOpen={setIsOpenedTokenPick}
        />
      </div>
    </Container>
  );
}
