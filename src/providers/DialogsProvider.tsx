"use client";
import { PropsWithChildren } from "react";

import SwapSettingsDialog from "@/app/[locale]/swap/components/SwapSettingsDialog";
import ConfirmInWalletAlert from "@/components/dialogs/ConfirmInWalletAlert";
import ConfirmInWalletDialog from "@/components/dialogs/ConfirmInWalletDialog";
import FeedbackDialog from "@/components/dialogs/FeedbackDialog";
import NoTokenListsEnabledWarning from "@/components/dialogs/NoTokenListsEnabledWarning";
import TokenPortfolioDialog from "@/components/dialogs/TokenPortfolioDialog";
import TransactionSpeedUpDialog from "@/components/dialogs/TransactionSpeedUpDialog";
import ManageTokensDialog from "@/components/manage-tokens/ManageTokensDialog";

export default function DialogsProvider({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <SwapSettingsDialog />
      <TransactionSpeedUpDialog />
      <ConfirmInWalletDialog />
      <FeedbackDialog />
      <TokenPortfolioDialog />

      <ConfirmInWalletAlert />
      <NoTokenListsEnabledWarning />
      <ManageTokensDialog />
    </>
  );
}
