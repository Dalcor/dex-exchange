import { useTranslations } from "next-intl";
import { useState } from "react";

import SelectButton from "@/components/atoms/SelectButton";
import ManageTokensDialog from "@/components/manage-tokens/ManageTokensDialog";
import { useManageTokensDialogStore } from "@/stores/useManageTokensDialogStore";

export default function TokenListsSettings() {
  const t = useTranslations("ManageTokens");
  const { isOpen, setIsOpen } = useManageTokensDialogStore();

  return (
    <div>
      <SelectButton
        className="py-1 xl:py-2 text-14 xl:text-16 min-h-8 w-full md:w-auto flex items-center justify-center"
        withArrow={false}
        size="regular"
        onClick={() => setIsOpen(!isOpen)}
      >
        {t("manage_tokens")}
      </SelectButton>
      <ManageTokensDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
}
