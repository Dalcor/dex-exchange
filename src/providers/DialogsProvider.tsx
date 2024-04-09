"use client";
import { PropsWithChildren } from "react";

import SwapSettingsDialog from "@/app/[locale]/swap/components/SwapSettingsDialog";
import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import TransactionSpeedUpDialog from "@/components/dialogs/TransactionSpeedUpDialog";

export default function DialogsProvider({ children }: PropsWithChildren) {
  const { isOpen, setIsOpen } = useTransactionSettingsDialogStore();

  return (
    <>
      {children}
      <SwapSettingsDialog isOpen={isOpen} setIsOpen={() => setIsOpen(!isOpen)} />
      <TransactionSpeedUpDialog />
    </>
  );
}
