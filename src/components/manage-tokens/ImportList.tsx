import { useTranslations } from "next-intl";
import { useState } from "react";

import DialogHeader from "@/components/atoms/DialogHeader";
import RadioButton from "@/components/buttons/RadioButton";
import ImportListWithContract from "@/components/manage-tokens/ImportListWithContract";
import ImportListWithJSON from "@/components/manage-tokens/ImportListWithJSON";
import ImportListWithURL from "@/components/manage-tokens/ImportListWithURL";
import { ManageTokensDialogContent } from "@/components/manage-tokens/types";

interface Props {
  setContent: (content: ManageTokensDialogContent) => void;
  handleClose: () => void;
}
//https://wispy-bird-88a7.uniswap.workers.dev/?url=https://tokenlist.aave.eth.link for test
export default function ImportList({ setContent, handleClose }: Props) {
  const t = useTranslations("ManageTokens");

  const [importType, setImportType] = useState<"url" | "json" | "contract">("contract");

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
          <RadioButton
            isActive={importType === "contract"}
            onClick={() => setImportType("contract")}
          >
            {t("contract")}
          </RadioButton>
          <RadioButton isActive={importType === "url"} onClick={() => setImportType("url")}>
            {t("URL")}
          </RadioButton>
          <RadioButton isActive={importType === "json"} onClick={() => setImportType("json")}>
            {t("JSON")}
          </RadioButton>
        </div>

        {importType === "url" && <ImportListWithURL setContent={setContent} />}

        {importType === "json" && <ImportListWithJSON setContent={setContent} />}
        {importType === "contract" && <ImportListWithContract setContent={setContent} />}
      </div>
    </>
  );
}
