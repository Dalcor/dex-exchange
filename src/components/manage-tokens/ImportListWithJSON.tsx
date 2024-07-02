import clsx from "clsx";
import { useTranslations } from "next-intl";
import { ChangeEvent, DragEvent, useCallback, useEffect, useRef, useState } from "react";

import Checkbox from "@/components/atoms/Checkbox";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import { ManageTokensDialogContent } from "@/components/manage-tokens/types";
import { db, TokenList } from "@/db/db";
import addToast from "@/other/toast";

interface Props {
  setContent: (content: ManageTokensDialogContent) => void;
}
export default function ImportListWithJSON({ setContent }: Props) {
  const t = useTranslations("ManageTokens");

  const [tokenListFile, setTokenListFile] = useState<File | undefined>();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];

    if (file) {
      setTokenListFile(file);
    } else {
      setTokenListFile(undefined);
    }
  };

  const [tokenListFileContent, setTokenListFileContent] = useState<TokenList | undefined>();

  useEffect(() => {
    if (tokenListFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (e.target) {
            const fileContents: any = e.target.result;
            const parsedJson = JSON.parse(fileContents);
            //TODO: Check that all tokens in list from same chain

            const listChainId = parsedJson.tokens[0].chainId;
            console.log(listChainId);

            console.log();
            if (listChainId) {
              setTokenListFileContent({
                enabled: true,
                list: parsedJson,
                chainId: listChainId,
              });
            }
          }
        } catch (e) {
          console.log(e);
        }
      };
      reader.readAsText(tokenListFile);
    }
  }, [tokenListFile]);

  const handleJSONImport = useCallback(() => {
    if (tokenListFileContent) {
      db.tokenLists.add(tokenListFileContent);
    }
  }, [tokenListFileContent]);

  const fileInput = useRef<HTMLInputElement | null>(null);

  const [checkedUnderstand, setCheckedUnderstand] = useState<boolean>(false);

  const [dragEntered, setDragEntered] = useState(false);

  const handleDragEnter = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragEntered(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragEntered(false);
  }, []);

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setTokenListFile(event.dataTransfer.files[0]);
    setDragEntered(false);
  }, []);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <div className="flex flex-col flex-grow">
      <input
        type="file"
        onChange={(e) => handleFileChange(e)}
        style={{ display: "none" }}
        ref={fileInput}
        accept=".json"
      />
      <div className="flex items-center justify-between">
        <div>
          <Button
            size={ButtonSize.MEDIUM}
            onClick={() => {
              if (fileInput.current && fileInput.current) {
                fileInput.current.click();
              }
            }}
            variant={ButtonVariant.OUTLINED}
          >
            {t("browse")}
          </Button>
        </div>
        <p className="overflow-hidden overflow-ellipsis whitespace-nowrap min-w-[200px] max-w-[300px] text-right">
          {tokenListFile?.name ? (
            `${tokenListFile?.name}`
          ) : (
            <span className="text-secondary-text">{t("select_json_file")}</span>
          )}
        </p>
      </div>
      {!tokenListFileContent && (
        <>
          <h3 className="text-16 font-bold mt-5 mb-1">{t("please_select_JSON_to_import")}</h3>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            className={clsx(
              "mb-5 rounded-2 flex justify-center items-center h-[288px] bg-drag-and-drop-dashed-pattern flex-grow duration-200",
              dragEntered ? "bg-green/20" : "bg-secondary-bg",
            )}
          >
            {t("import_files_or_drag_and_drop")}
          </div>
        </>
      )}
      {tokenListFileContent && (
        <>
          <div className="flex-grow">
            <div className="flex items-center gap-3 py-2.5 mt-3 mb-3">
              <img
                className="w-12 h-12"
                width={48}
                height={48}
                src={tokenListFileContent.list.logoURI}
                alt=""
              />
              <div className="flex flex-col text-16">
                <span className="text-primary-text">{tokenListFileContent.list.name}</span>
                <span className="text-secondary-text">
                  {t("tokens_amount", { amount: tokenListFileContent.list.tokens.length })}
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
              disabled={!checkedUnderstand}
              size={ButtonSize.MEDIUM}
              onClick={() => {
                handleJSONImport();
                setContent("default");
                addToast(t("list_imported"));
              }}
            >
              {t("import_with_JSON")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
