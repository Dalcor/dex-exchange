"use client";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Address, parseUnits } from "viem";
import {
  useAccount,
  useBalance,
  useBlockNumber,
  useChainId,
  useReadContract,
  useSimulateContract,
  useWalletClient,
  useWriteContract,
} from "wagmi";

import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import SystemIconButton from "@/components/buttons/SystemIconButton";
import NetworkFeeConfigDialog from "@/components/dialogs/NetworkFeeConfigDialog";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import TokenInput from "@/components/others/TokenInput";
import { QUOTER_ABI } from "@/config/abis/quoter";
import { WrappedToken } from "@/config/types/WrappedToken";
import useAllowance from "@/hooks/useAllowance";
import { usePool, usePools } from "@/hooks/usePools";
import { FeeAmount } from "@/sdk";

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
export default function SwapPage() {
  const t = useTranslations("Trade");

  const [isOpenedFee, setIsOpenedFee] = useState(false);
  const [isOpenedTokenPick, setIsOpenedTokenPick] = useState(false);

  const { setIsOpen } = useTransactionSettingsDialogStore();

  const chainId = useChainId();

  const { address } = useAccount();

  const balance = useBalance({
    chainId,
    address,
  });

  const lang = useLocale();

  const { tokenA, tokenB, setTokenA, setTokenB } = useSwapTokensStore();

  const [currentlyPicking, setCurrentlyPicking] = useState<"tokenA" | "tokenB">("tokenA");

  const handlePick = useCallback(
    (token: WrappedToken) => {
      if (currentlyPicking === "tokenA") {
        setTokenA(token);
        // if (tokenB) {
        //   const newPath = `/${lang}/add/${token.address}/${tokenB.address}`;
        //   window.history.replaceState(null, "", newPath);
        // } else {
        //   const newPath = `/${lang}/add/${token.address}`;
        //   window.history.replaceState(null, "", newPath);
        // }
      }

      if (currentlyPicking === "tokenB") {
        setTokenB(token);
        // if (tokenA) {
        //   const newPath = `/${lang}/add/${tokenA.address}/${token.address}`;
        //   window.history.replaceState(null, "", newPath);
        // } else {
        //   const newPath = `/${lang}/add/undefined/${token.address}`;
        //   window.history.replaceState(null, "", newPath);
        // }
      }

      setIsOpenedTokenPick(false);
    },
    [currentlyPicking, setTokenA, setTokenB],
  );

  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");

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

  const poolKeys: any = useMemo(() => {
    return [
      [tokenA, tokenB, FeeAmount.LOWEST],
      [tokenA, tokenB, FeeAmount.LOW],
      [tokenA, tokenB, FeeAmount.MEDIUM],
      [tokenA, tokenB, FeeAmount.HIGH],
    ];
  }, [tokenA, tokenB]);

  const { data: walletClient } = useWalletClient();

  const handleSwap = useCallback(async () => {
    if (!walletClient) {
      return;
    }

    const res = await walletClient.writeContract({
      address: quoterAddress,
      abi: QUOTER_ABI,
      functionName: "quoteExactInputSingle",
      args: [
        tokenA?.address as Address,
        tokenB?.address as Address,
        FeeAmount.MEDIUM,
        BigInt(1),
        BigInt(0),
      ],
    });
  }, [amountA, amountB, tokenA, tokenB, walletClient]);

  const { data, error, failureReason } = useSimulateContract({
    address: quoterAddress,
    abi: QUOTER_ABI,
    functionName: "quoteExactInputSingle",
    args: [
      tokenA?.address as Address,
      tokenB?.address as Address,
      FeeAmount.MEDIUM,
      BigInt(0),
      BigInt(0),
    ],
    gas: BigInt(10_000_000),
  });

  const {
    isAllowed: isAllowedA,
    writeTokenApprove: approveA,
    isApproving: isApprovingA,
  } = useAllowance({
    token: tokenA,
    contractAddress: quoterAddress,
    amountToCheck: parseUnits("20", tokenA?.decimals || 18),
  });

  const {
    isAllowed: isAllowedB,
    writeTokenApprove: approveB,
    isApproving: isApprovingB,
  } = useAllowance({
    token: tokenB,
    contractAddress: quoterAddress,
    amountToCheck: parseUnits("20", tokenB?.decimals || 18),
  });

  return (
    <>
      <Container>
        <div className="py-[80px] flex justify-center">
          <div className="grid gap-5 w-[600px]">
            <div>
              <div className="flex justify-between rounded-t-1 bg-tertiary-bg border-secondary-border border py-2 px-5">
                <div className="flex items-center gap-2.5">
                  <Svg iconName="wallet" size={32} />
                  Wallet balance: {balance?.data?.formatted} ETH
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-green">
                    <Svg iconName="check" size={32} />
                  </span>
                  <Tooltip text="Wallet balance tooltip" />
                </div>
              </div>
              <div className="flex justify-between items-center bg-primary-bg rounded-b-1 text-secondary-text border-secondary-border border border-t-0 py-2 px-5">
                <div className="flex items-center gap-2.5">
                  <Svg iconName="borrow" size={32} />
                  Borrowed balance: 0 ETH
                </div>
                <Tooltip text="Wallet balance tooltip" />
              </div>
            </div>

            <div className="px-5 pt-2.5 pb-5 bg-primary-bg rounded-2 border border-secondary-border">
              <div className="flex justify-between items-center mb-2.5">
                <h3 className="font-bold text-20">Swap</h3>
                <SystemIconButton
                  iconSize={32}
                  iconName="settings"
                  onClick={() => setIsOpen(true)}
                />
              </div>
              <TokenInput
                value={amountA}
                onInputChange={(value) => setAmountA(value)}
                handleClick={() => {
                  setCurrentlyPicking("tokenA");
                  setIsOpenedTokenPick(true);
                }}
                token={tokenA}
                balance={tokenABalance?.formatted}
              />
              <div className="relative h-3">
                <button className="text-secondary-text w-[48px] h-[48px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-secondary-bg rounded-1 flex items-center justify-center border border-primary-border hover:bg-green duration-200 hover:text-global-bg hover:border-green">
                  <Svg iconName="swap" />
                </button>
              </div>
              <TokenInput
                value={amountB}
                onInputChange={(value) => setAmountB(value)}
                handleClick={() => {
                  setCurrentlyPicking("tokenB");
                  setIsOpenedTokenPick(true);
                }}
                token={tokenB}
                balance={tokenBBalance?.formatted}
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
              <div className="grid gap-2 mb-2 grid-cols-2">
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
              <Button onClick={handleSwap} fullWidth>
                Swap
              </Button>
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
