import clsx from "clsx";
import { ChangeEvent, DragEvent, useCallback, useEffect, useRef, useState } from "react";

import Checkbox from "@/components/atoms/Checkbox";
import DialogHeader from "@/components/atoms/DialogHeader";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Input from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import RadioButton from "@/components/buttons/RadioButton";
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
  const [tokenListAddressToImport, setTokenListAddressToImport] = useState("");
  const [tokenListFile, setTokenListFile] = useState<File | undefined>();

  const [tokenListToImport, setTokenListToImport] = useState<TokenList | null>(null);

  useEffect(() => {
    IIFE(async () => {
      try {
        const data = await fetchTokenList(tokenListAddressToImport);

        console.log(data);
        if (data) {
          setTokenListToImport({
            enabled: true,
            list: data,
          });
        }
      } catch (e) {
        console.log(e);
      }
    });
  }, [tokenListAddressToImport]);

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

            setTokenListFileContent({
              enabled: true,
              list: parsedJson,
            });
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
  const [importType, setImportType] = useState<"url" | "json" | "contract">("url");
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
    <>
      <DialogHeader
        onBack={() => setContent("default")}
        onClose={handleClose}
        title="Import list"
      />

      <div className="px-4 pb-4 md:px-10 md:pb-10 w-full md:w-[550px] h-[580px] flex flex-col">
        <h3 className="text-16 font-bold mb-1">Importing type</h3>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <RadioButton isActive={importType === "url"} onClick={() => setImportType("url")}>
            URL
          </RadioButton>
          <RadioButton isActive={importType === "json"} onClick={() => setImportType("json")}>
            JSON
          </RadioButton>
          <RadioButton
            isActive={importType === "contract"}
            onClick={() => setImportType("contract")}
          >
            Contract
          </RadioButton>
        </div>

        {importType === "url" && (
          <div className="flex flex-col flex-grow">
            <h3 className="text-16 font-bold mb-1">Import token list from URL</h3>

            <Input
              value={tokenListAddressToImport}
              onChange={(e) => setTokenListAddressToImport(e.target.value)}
              placeholder="https:// or ipfs://"
            />

            {!tokenListToImport && (
              <div className="flex-grow flex justify-center items-center flex-col gap-2">
                <EmptyStateIcon iconName="imported" />
                <p className="text-secondary-text text-center">
                  To import a list through a URL, enter a link in the format https:// or ipfs://
                </p>
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
                        {tokenListToImport.list.tokens.length} tokens
                      </span>
                    </div>
                  </div>
                  <div className="px-5 py-3 flex gap-2 rounded-1 border border-orange bg-orange-bg">
                    <Svg className="text-orange shrink-0" iconName="warning" />
                    <p className="text-16 text-primary-text flex-grow">
                      By adding this list you are implicitly trusting that the data is correct.
                      Anyone can create a list, including creating fake versions of existing lists
                      and lists that claim to represent projects that do not have one.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  <Checkbox
                    checked={checkedUnderstand}
                    handleChange={() => setCheckedUnderstand(!checkedUnderstand)}
                    id="approve-list-import"
                    label="I understand"
                  />
                  <Button
                    fullWidth
                    size={ButtonSize.MEDIUM}
                    disabled={!checkedUnderstand}
                    onClick={() => {
                      db.tokenLists.add(tokenListToImport);

                      setContent("default");
                      addToast("List imported");
                    }}
                  >
                    Import with URL
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {importType === "json" && (
          <div className="flex flex-col flex-grow">
            <input
              type="file"
              onChange={(e) => handleFileChange(e)}
              style={{ display: "none" }}
              ref={fileInput}
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
                  {tokenListFileContent ? "Choose another list" : "Browse..."}
                </Button>
              </div>
              <p className="overflow-hidden overflow-ellipsis whitespace-nowrap w-[200px]">
                {tokenListFile?.name ? (
                  `${tokenListFile?.name}`
                ) : (
                  <span className="text-secondary-text">Select json file</span>
                )}
              </p>
            </div>
            {!tokenListFileContent && (
              <>
                <h3 className="text-16 font-bold mt-5 mb-1">Please select JSON file to import</h3>
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
                  Import files or Drag & Drop
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
                        {tokenListFileContent.list.tokens.length} tokens
                      </span>
                    </div>
                  </div>
                  <div className="px-5 py-3 flex gap-2 rounded-1 border border-orange bg-orange-bg">
                    <Svg className="text-orange shrink-0" iconName="warning" />
                    <p className="text-16 text-primary-text flex-grow">
                      By adding this list you are implicitly trusting that the data is correct.
                      Anyone can create a list, including creating fake versions of existing lists
                      and lists that claim to represent projects that do not have one.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  <Checkbox
                    checked={checkedUnderstand}
                    handleChange={() => setCheckedUnderstand(!checkedUnderstand)}
                    id="approve-list-import"
                    label="I understand"
                  />
                  <Button
                    fullWidth
                    size={ButtonSize.MEDIUM}
                    onClick={() => {
                      handleJSONImport();
                      setContent("default");
                      addToast("List imported");
                    }}
                  >
                    Import with JSON
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
        {importType === "contract" && (
          <div className="flex flex-col gap-4 flex-grow items-center justify-center">
            <Svg size={80} iconName="settings" />
            <span className="text-secondary-text">This page is under development</span>
          </div>
        )}
      </div>
    </>
  );
}
