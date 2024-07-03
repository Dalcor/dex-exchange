import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import Checkbox from "@/components/atoms/Checkbox";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import { SearchInput } from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonSize } from "@/components/buttons/Button";
import { ManageTokensDialogContent } from "@/components/manage-tokens/types";
import { db, TokenList } from "@/db/db";
import { IIFE } from "@/functions/iife";
import { fetchTokenList } from "@/hooks/useTokenLists";
import addToast from "@/other/toast";
interface Props {
  setContent: (content: ManageTokensDialogContent) => void;
}
export default function ImportListWithURL({ setContent }: Props) {
  const t = useTranslations("ManageTokens");

  const [tokenListAddressToImport, setTokenListAddressToImport] = useState("");
  const [tokenListToImport, setTokenListToImport] = useState<TokenList | null>(null);
  const [checkedUnderstand, setCheckedUnderstand] = useState<boolean>(false);

  useEffect(() => {
    IIFE(async () => {
      try {
        const data = await fetchTokenList(tokenListAddressToImport);

        //TODO: Check that all tokens in list from same chain
        const listChainId = data.tokens[0].chainId;

        if (data && listChainId) {
          setTokenListToImport({
            enabled: true,
            chainId: listChainId,
            list: data,
          });
        }
      } catch (e) {
        console.log(e);
      }
    });
  }, [tokenListAddressToImport]);

  return (
    <div className="flex flex-col flex-grow">
      <h3 className="text-16 font-bold mb-1">{t("import_with_URL")}</h3>

      <SearchInput
        value={tokenListAddressToImport}
        onChange={(e) => setTokenListAddressToImport(e.target.value)}
        placeholder={t("https_or_ipfs_placeholder")}
      />

      {!tokenListToImport && (
        <div className="flex-grow flex justify-center items-center flex-col gap-2">
          <EmptyStateIcon iconName="imported" />
          <p className="text-secondary-text text-center">{t("to_import_through_URL")}</p>
        </div>
      )}

      {tokenListToImport && (
        <>
          <div className="flex-grow">
            <div className="flex items-center gap-3 py-2.5 mt-3 mb-3">
              <img
                className="w-12 h-12"
                width={48}
                height={48}
                src={tokenListToImport.list.logoURI}
                alt=""
              />
              <div className="flex flex-col text-16">
                <span className="text-primary-text">{tokenListToImport.list.name}</span>
                <span className="text-secondary-text">
                  {t("tokens_amount", { amount: tokenListToImport.list.tokens.length })}
                </span>
              </div>
            </div>
            <div className="px-5 py-3 flex gap-2 rounded-1 border border-orange bg-orange-bg">
              <Svg className="text-orange shrink-0" iconName="warning" />
              <p className="text-16 text-primary-text flex-grow">{t("adding_list_warning")}</p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <Checkbox
              checked={checkedUnderstand}
              handleChange={() => setCheckedUnderstand(!checkedUnderstand)}
              id="approve-list-import"
              label={t("i_understand")}
            />
            <Button
              fullWidth
              size={ButtonSize.MEDIUM}
              disabled={!checkedUnderstand}
              onClick={() => {
                db.tokenLists.add(tokenListToImport);

                setContent("default");
                addToast(t("list_imported"));
              }}
            >
              {t("import_with_URL")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
