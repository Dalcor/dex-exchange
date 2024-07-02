import clsx from "clsx";
import { useTranslations } from "next-intl";
import { ChangeEvent, DragEvent, useCallback, useEffect, useRef, useState } from "react";

import Checkbox from "@/components/atoms/Checkbox";
import DialogHeader from "@/components/atoms/DialogHeader";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Input from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import RadioButton from "@/components/buttons/RadioButton";
import ImportListWithContract from "@/components/manage-tokens/ImportListWithContract";
import ImportListWithJSON from "@/components/manage-tokens/ImportListWithJSON";
import ImportListWithURL from "@/components/manage-tokens/ImportListWithURL";
import { ManageTokensDialogContent } from "@/components/manage-tokens/types";
import { db, TokenList } from "@/db/db";
import { IIFE } from "@/functions/iife";
import { fetchTokenList } from "@/hooks/useTokenLists";
import addToast from "@/other/toast";

interface Props {
  setContent: (content: ManageTokensDialogContent) => void;
  handleClose: () => void;
}
//https://wispy-bird-88a7.uniswap.workers.dev/?url=https://tokenlist.aave.eth.link for test
function getListImage(url: string) {
  if (url.startsWith("ipfs")) {
    return `https://cloudflare-ipfs.com/${url.replace(":/", "")}`;
  }

  return url;
}

export default function ImportList({ setContent, handleClose }: Props) {
  const t = useTranslations("ManageTokens");

  const [importType, setImportType] = useState<"url" | "json" | "contract">("url");

  return (
    <>
      <DialogHeader
        onBack={() => setContent("default")}
        onClose={handleClose}
        title={t("import_list")}
      />

      <div className="px-4 pb-4 md:px-10 md:pb-10 w-full md:w-[550px] h-[580px] flex flex-col">
        <h3 className="text-16 font-bold mb-1">{t("importing_type")}</h3>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <RadioButton isActive={importType === "url"} onClick={() => setImportType("url")}>
            {t("URL")}
          </RadioButton>
          <RadioButton isActive={importType === "json"} onClick={() => setImportType("json")}>
            {t("JSON")}
          </RadioButton>
          <RadioButton
            isActive={importType === "contract"}
            onClick={() => setImportType("contract")}
          >
            {t("contract")}
          </RadioButton>
        </div>

        {importType === "url" && <ImportListWithURL setContent={setContent} />}

        {importType === "json" && <ImportListWithJSON setContent={setContent} />}
        {importType === "contract" && <ImportListWithContract setContent={setContent} />}
      </div>
    </>
  );
}
