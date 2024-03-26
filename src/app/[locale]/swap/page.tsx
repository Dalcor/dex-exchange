"use client";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Address, formatUnits, getAbiItem, parseUnits } from "viem";
import {
  useAccount,
  useBalance,
  useBlockNumber,
  useChainId,
  usePublicClient,
  useWalletClient,
} from "wagmi";

import { tryParseCurrencyAmount } from "@/app/[locale]/add/[[...currency]]/components/DepositAmount";
import useSwap from "@/app/[locale]/swap/hooks/useSwap";
import { useTrade } from "@/app/[locale]/swap/libs/trading";
import { Field, useSwapAmountsStore } from "@/app/[locale]/swap/stores/useSwapAmountsStore";
import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import SystemIconButton from "@/components/buttons/SystemIconButton";
import NetworkFeeConfigDialog from "@/components/dialogs/NetworkFeeConfigDialog";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import RecentTransaction from "@/components/others/RecentTransaction";
import SelectedTokensInfo from "@/components/others/SelectedTokensInfo";
import TokenInput from "@/components/others/TokenInput";
import { ERC20_ABI } from "@/config/abis/erc20";
import { ROUTER_ABI } from "@/config/abis/router";
import { WrappedToken } from "@/config/types/WrappedToken";
import useAllowance from "@/hooks/useAllowance";
import useTransactionDeadline from "@/hooks/useTransactionDeadline";
import { FeeAmount } from "@/sdk";
import { Currency } from "@/sdk/entities/currency";
import { CurrencyAmount } from "@/sdk/entities/fractions/currencyAmount";
import {
  GasFeeModel,
  RecentTransactionTitleTemplate,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";
import { useRecentTransactionTracking } from "@/stores/useRecentTransactionTracking";
import { useTransactionSettingsStore } from "@/stores/useTransactionSettingsStore";

//sepolia v3 addresses I found
// UniversalRouter: 0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD
// swap router: 0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E
// v3CoreFactoryAddress: 0x0227628f3F023bb0B980b67D528571c95c6DaC1c
// multicallAddress: 0xD7F33bCdb21b359c8ee6F0251d30E94832baAd07
// quoterAddress: 0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3
// v3MigratorAddress: 0x729004182cF005CEC8Bd85df140094b6aCbe8b15
// nonfungiblePositionManagerAddress: 0x1238536071E1c677A632429e3655c799b22cDA52
// tickLensAddress: 0xd7f33bcdb21b359c8ee6f0251d30e94832baad07
// WETH: 0xfff9976782d46cc05630d1f6ebab18b2324d6b14
// USD: 0x6f14C02Fc1F78322cFd7d707aB90f18baD3B54f5

const quoterAddress = "0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3";
const swapAddress = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E";

function SwapActionButton() {
  const { tokenA, tokenB } = useSwapTokensStore();
  const { typedValue } = useSwapAmountsStore();

  const { handleSwap } = useSwap();

  const {
    isAllowed: isAllowedA,
    writeTokenApprove: approveA,
    isApproving: isApprovingA,
  } = useAllowance({
    token: tokenA,
    contractAddress: swapAddress,
    amountToCheck: parseUnits(typedValue, tokenA?.decimals || 18),
  });

  if (!tokenA || !tokenB) {
    return (
      <Button variant="outline" fullWidth disabled>
        Select tokens
      </Button>
    );
  }

  if (!typedValue) {
    return (
      <Button variant="outline" fullWidth disabled>
        Enter amount
      </Button>
    );
  }

  if (!isAllowedA) {
    return (
      <Button fullWidth variant="outline" onClick={() => approveA()}>
        {isApprovingA ? "Loading..." : <span>Approve {tokenA?.symbol}</span>}
      </Button>
    );
  }

  return (
    <Button onClick={handleSwap} fullWidth>
      Swap
    </Button>
  );
}
export default function SwapPage() {
  useRecentTransactionTracking();

  const t = useTranslations("Trade");

  const [isOpenedFee, setIsOpenedFee] = useState(false);
  const [isOpenedTokenPick, setIsOpenedTokenPick] = useState(false);

  const { setIsOpen } = useTransactionSettingsDialogStore();

  const { slippage, deadline: _deadline } = useTransactionSettingsStore();
  const deadline = useTransactionDeadline(_deadline);

  const { address } = useAccount();

  const lang = useLocale();

  const { tokenA, tokenB, setTokenA, setTokenB } = useSwapTokensStore();

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

  const trade = useTrade();

  const { setTypedValue, independentField, dependentField, typedValue } = useSwapAmountsStore();

  const currencies = {
    [Field.CURRENCY_A]: tokenA,
    [Field.CURRENCY_B]: tokenB,
  };

  // amounts
  const independentAmount: CurrencyAmount<Currency> | undefined = tryParseCurrencyAmount(
    typedValue,
    currencies[independentField],
  );

  const dependentAmount: CurrencyAmount<Currency> | undefined = useMemo(() => {
    return trade?.outputAmount;
  }, [trade?.outputAmount]);

  console.log("Trade");
  console.log(trade);

  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { data: tokenABalance, refetch: refetchBalanceA } = useBalance({
    address: tokenA ? address : undefined,
    token: tokenA ? (tokenA.address as Address) : undefined,
  });

  const { data: tokenBBalance, refetch: refetchBalanceB } = useBalance({
    address: tokenB ? address : undefined,
    token: tokenB ? (tokenB.address as Address) : undefined,
  });

  useEffect(() => {
    refetchBalanceA();
    refetchBalanceB();
  }, [blockNumber, refetchBalanceA, refetchBalanceB]);

  const output = useMemo(() => {
    if (!trade) {
      return "";
    }

    return (+trade.outputAmount.toSignificant() * (100 - slippage)) / 100;
  }, [slippage, trade]);

  console.log("output");
  console.log(output);

  const { transactions } = useRecentTransactionsStore();

  const _transactions = useMemo(() => {
    if (address && transactions[address]) {
      return transactions[address];
    }

    return [];
  }, [address, transactions]);

  const [effect, setEffect] = useState(false);

  return (
    <>
      <Container>
        <div className="grid grid-cols-2 py-[80px]">
          <div className="px-10 pt-2.5 pb-5 bg-primary-bg rounded-5">
            <div className="flex justify-between items-center mb-2.5">
              <h3 className="font-bold text-20">Transactions</h3>
              <div className="flex items-center">
                <SystemIconButton iconSize={24} iconName="close" onClick={() => setIsOpen(true)} />
              </div>
            </div>
            <div>
              {_transactions.length ? (
                <div className="min-h-[324px] flex flex-col gap-1">
                  {_transactions.map((transaction) => {
                    return <RecentTransaction transaction={transaction} key={transaction.hash} />;
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[324px] gap-2">
                  <Image src="/empty/empty-history.svg" width={80} height={80} alt="" />
                  <span className="text-secondary-text">
                    All transaction will be displayed here.
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            <div className="grid gap-5 w-[600px]">
              <div className="px-10 pt-2.5 pb-5 bg-primary-bg rounded-5">
                <div className="flex justify-between items-center mb-2.5">
                  <h3 className="font-bold text-20">Swap</h3>
                  <div className="flex items-center">
                    <SystemIconButton
                      iconSize={24}
                      iconName="recent-transactions"
                      onClick={() => setIsOpen(true)}
                    />
                    <SystemIconButton
                      iconSize={24}
                      iconName="settings"
                      onClick={() => setIsOpen(true)}
                    />
                  </div>
                </div>
                <TokenInput
                  value={typedValue}
                  onInputChange={(value) =>
                    setTypedValue({ typedValue: value, field: Field.CURRENCY_A })
                  }
                  handleClick={() => {
                    setCurrentlyPicking("tokenA");
                    setIsOpenedTokenPick(true);
                  }}
                  token={tokenA}
                  balance={tokenABalance?.formatted}
                  label="You pay"
                />
                <div className="relative h-3 z-10">
                  <button
                    onClick={() => {
                      setEffect(true);
                    }}
                    className="border-[3px] text-green border-tertiary-bg outline outline-tertiary-bg  w-10 h-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-secondary-bg rounded-full flex items-center justify-center duration-200 hover:outline-green hover:shadow-checkbox"
                  >
                    <Svg
                      className={effect ? "animate-swap" : ""}
                      onAnimationEnd={() => setEffect(false)}
                      iconName="swap"
                    />
                  </button>
                </div>
                <TokenInput
                  value={dependentAmount?.toSignificant() || ""}
                  onInputChange={(value) => null}
                  handleClick={() => {
                    setCurrentlyPicking("tokenB");
                    setIsOpenedTokenPick(true);
                  }}
                  token={tokenB}
                  balance={tokenBBalance?.formatted}
                  label="You receive"
                />

                <div className="my-3 py-3 px-5 border border-primary-border flex justify-between">
                  <div className="flex items-center gap-1">
                    <Tooltip text="Network fee" />
                    Network fee
                  </div>
                  <div className="flex gap-1">
                    <span className="text-secondary-text">
                      <Svg iconName="gas" />
                    </span>
                    <span className="mr-1">$1.95</span>
                    <button
                      className="duration-200 text-green hover:text-green-hover"
                      onClick={() => setIsOpenedFee(true)}
                    >
                      EDIT
                    </button>
                    <NetworkFeeConfigDialog isOpen={isOpenedFee} setIsOpen={setIsOpenedFee} />
                  </div>
                </div>
                <SwapActionButton />
              </div>
              <SelectedTokensInfo tokenA={tokenA} tokenB={tokenB} />
            </div>
          </div>
        </div>

        <PickTokenDialog
          handlePick={handlePick}
          isOpen={isOpenedTokenPick}
          setIsOpen={setIsOpenedTokenPick}
        />
      </Container>
    </>
  );
}
