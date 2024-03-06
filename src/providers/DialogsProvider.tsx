"use client";
import { PropsWithChildren } from "react";

import { useTransactionSettingsDialogStore } from "@/components/dialogs/stores/useTransactionSettingsDialogStore";
import TransactionSettingsDialog from "@/components/dialogs/SwapSettingsDialog";

export default function DialogsProvider({ children }: PropsWithChildren) {
  const { isOpen, setIsOpen } = useTransactionSettingsDialogStore();

  return (
    <>
      {children}
      <TransactionSettingsDialog isOpen={isOpen} setIsOpen={() => setIsOpen(!isOpen)} />
    </>
  );
}
