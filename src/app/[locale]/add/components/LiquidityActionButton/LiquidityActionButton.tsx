import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Address } from "viem";
import { useAccount, useBalance, useBlockNumber } from "wagmi";

import Button, { ButtonVariant } from "@/components/buttons/Button";
import { useConnectWalletDialogStateStore } from "@/components/dialogs/stores/useConnectWalletStore";

import { useLiquidityApprove } from "../../hooks/useLiquidityApprove";
import { usePriceRange } from "../../hooks/usePrice";
import { useV3DerivedMintInfo } from "../../hooks/useV3DerivedMintInfo";
import {
  Field,
  useLiquidityAmountsStore,
  useTokensStandards,
} from "../../stores/useAddLiquidityAmountsStore";
import { useAddLiquidityTokensStore } from "../../stores/useAddLiquidityTokensStore";
import { useLiquidityTierStore } from "../../stores/useLiquidityTierStore";
import { ApproveButton } from "./ApproveButton";
import { MintButton } from "./MintButton";

export const LiquidityActionButton = ({
  increase = false,
  tokenId,
}: {
  increase?: boolean;
  tokenId?: string;
}) => {
  const t = useTranslations("Liquidity");
  const tWallet = useTranslations("Wallet");

  const { tokenA, tokenB } = useAddLiquidityTokensStore();
  const { tier } = useLiquidityTierStore();
  const { price } = usePriceRange();
  const { tokenAStandard, tokenBStandard } = useTokensStandards();
  const { address, isConnected } = useAccount();

  const { approveTransactionsCount } = useLiquidityApprove();
  const { setIsOpened: setWalletConnectOpened } = useConnectWalletDialogStateStore();

  const { typedValue } = useLiquidityAmountsStore();

  const { parsedAmounts } = useV3DerivedMintInfo({
    tokenA,
    tokenB,
    tier,
    price,
  });

  const { data: blockNumber } = useBlockNumber({ watch: true });

  const { data: tokenA0Balance, refetch: refetchBalanceA0 } = useBalance({
    address: tokenA ? address : undefined,
    token: tokenA ? (tokenA.address0 as Address) : undefined,
  });
  const { data: tokenA1Balance, refetch: refetchBalanceA1 } = useBalance({
    address: tokenA ? address : undefined,
    token: tokenA ? (tokenA.address1 as Address) : undefined,
  });

  const { data: tokenB0Balance, refetch: refetchBalanceB0 } = useBalance({
    address: tokenB ? address : undefined,
    token: tokenB ? (tokenB.address0 as Address) : undefined,
  });
  const { data: tokenB1Balance, refetch: refetchBalanceB1 } = useBalance({
    address: tokenB ? address : undefined,
    token: tokenB ? (tokenB.address1 as Address) : undefined,
  });

  useEffect(() => {
    refetchBalanceA0();
    refetchBalanceA1();
    refetchBalanceB0();
    refetchBalanceB1();
  }, [blockNumber, refetchBalanceA0, refetchBalanceB0, refetchBalanceA1, refetchBalanceB1]);

  const amountToCheckA = parsedAmounts[Field.CURRENCY_A]
    ? BigInt(parsedAmounts[Field.CURRENCY_A].quotient.toString())
    : BigInt(0);
  const amountToCheckB = parsedAmounts[Field.CURRENCY_B]
    ? BigInt(parsedAmounts[Field.CURRENCY_B].quotient.toString())
    : BigInt(0);

  const isSufficientBalanceA =
    tokenAStandard === "ERC-20"
      ? tokenA0Balance
        ? tokenA0Balance?.value >= amountToCheckA
        : false
      : tokenA1Balance
        ? tokenA1Balance?.value >= amountToCheckA
        : false;

  const isSufficientBalanceB =
    tokenBStandard === "ERC-20"
      ? tokenB0Balance
        ? tokenB0Balance?.value >= amountToCheckB
        : false
      : tokenB1Balance
        ? tokenB1Balance?.value >= amountToCheckB
        : false;

  const isSufficientBalance = isSufficientBalanceA && isSufficientBalanceB;

  if (!isConnected) {
    return (
      <Button onClick={() => setWalletConnectOpened(true)} fullWidth>
        {tWallet("connect_wallet")}
      </Button>
    );
  }

  if (!tokenA || !tokenB) {
    return (
      <Button variant={ButtonVariant.OUTLINED} fullWidth disabled>
        {t("select_tokens")}
      </Button>
    );
  }

  if (!typedValue || typedValue === "0") {
    return (
      <Button variant={ButtonVariant.OUTLINED} fullWidth disabled>
        {t("button_enter_amount")}
      </Button>
    );
  }

  if (!isSufficientBalance) {
    return (
      <Button variant={ButtonVariant.OUTLINED} fullWidth disabled>
        {t("button_insufficient_balance")}
      </Button>
    );
  }

  if (approveTransactionsCount) {
    return <ApproveButton />;
  }

  return <MintButton increase={increase} tokenId={tokenId} />;
};
