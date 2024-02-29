import DialogHeader from "@/components/atoms/DialogHeader";
import Input from "@/components/atoms/Input";
import { AvailableChains } from "@/components/dialogs/stores/useConnectWalletStore";
import { useAccount, useReadContract } from "wagmi";
import { ChangeEvent, useCallback, useEffect, useRef, useState, DragEvent,  } from "react";
import { useTokenListsStore } from "@/stores/useTokenListsStore";
import { ManageTokensDialogContent } from "@/components/manage-tokens/types";
import Button from "@/components/atoms/Button";
import RadioButton from "@/components/buttons/RadioButton";
import { IIFE } from "@/functions/iife";
import { fetchTokenList } from "@/hooks/useTokenLists";
import { TokenList } from "@/config/types/TokenList";
import Image from "next/image";
import Svg from "@/components/atoms/Svg";
import Checkbox from "@/components/atoms/Checkbox";
import addToast from "@/other/toast";

interface Props {
  setContent: (content: ManageTokensDialogContent) => void,
  handleClose: () => void
}
//https://wispy-bird-88a7.uniswap.workers.dev/?url=https://tokenlist.aave.eth.link for test
function getListImage(url: string) {
  if (url.startsWith("ipfs")) {
    return `https://cloudflare-ipfs.com/${url.replace(":/", '')}`
  }

  return url;
}

export default function ImportList({ setContent, handleClose }: Props) {
  const { chainId } = useAccount();
  const [tokenListAddressToImport, setTokenListAddressToImport] = useState("");
  const [tokenListFile, setTokenListFile] = useState<File | undefined>();

  const [tokenListToImport, setTokenListToImport] = useState<TokenList | null>(null);

  useEffect(() => {

    IIFE(async () => {
      try {
        const data = await fetchTokenList(tokenListAddressToImport);

        if (data) {
          setTokenListToImport(data);
        }
      } catch (e) {
        console.log(e);
      }
    })

  }, [tokenListAddressToImport]);

  console.log("LIST TO IMG");
  console.log(tokenListToImport);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];

    if (file) {
      setTokenListFile(file);
    } else {
      setTokenListFile(undefined);
    }
  };

  const { addTokenList } = useTokenListsStore();

  const handleJSONImport = useCallback(() => {
    if (tokenListFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (e.target) {
            const fileContents: any = e.target.result;
            const parsedJson = JSON.parse(fileContents);
            console.log(parsedJson);

            addTokenList({
              name: "Imported list#1",
              enabled: true,
              list: parsedJson,
              id: "1234"
            }, chainId as AvailableChains);
          }
        } catch (e) {
          console.log(e);
        }
      };
      reader.readAsText(tokenListFile);
    }
  }, [addTokenList, chainId, tokenListFile]);

  const fileInput = useRef<HTMLInputElement | null>(null);
  const [importType, setImportType] = useState<"url" | "json">("url")
  const [checkedUnderstand, setCheckedUnderstand] = useState<boolean>(false);

  console.log(getListImage(tokenListToImport?.logoURI || ""));

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setTokenListFile(event.dataTransfer.files[0]);
  }, [])

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, [])

  return <>
    <DialogHeader onBack={() => setContent("default")} onClose={handleClose} title="Import list"/>

    <div className="px-10 pb-10 w-[550px] h-[580px] flex flex-col">
      <h3 className="text-16 font-bold mb-1">Importing type</h3>
      <div className="grid grid-cols-2 gap-2 mb-5">
        <RadioButton isActive={importType === "url"} onClick={() => setImportType("url")}>From URL</RadioButton>
        <RadioButton isActive={importType === "json"} onClick={() => setImportType("json")}>From JSON</RadioButton>
      </div>

      {importType === "url" && <div className="flex flex-col flex-grow">
        <h3 className="text-16 font-bold mb-1">Import token list from URL</h3>

        <Input value={tokenListAddressToImport} onChange={(e) => setTokenListAddressToImport(e.target.value)}
               placeholder="https:// or ipfs://"/>

        {tokenListToImport && <>
          <div className="flex-grow">

            <div className="flex items-center gap-3 py-2.5 mt-3 mb-3">
              <img className="w-12 h-12" width={48} height={48} src={getListImage(tokenListToImport.logoURI)} alt=""/>
              <div className="flex flex-col text-16">
                <span className="text-primary-text">{tokenListToImport.name}</span>
                <span className="text-secondary-text">{tokenListToImport.tokens.length} tokens</span>
              </div>
            </div>
            <div className="px-5 py-3 flex gap-2 rounded-1 border border-orange bg-orange-bg">
              <Svg className="text-orange shrink-0" iconName="warning"/>
              <p className="text-16 text-primary-text flex-grow">
                By adding this list you are implicitly trusting that the data is correct. Anyone can create a list,
                including creating fake versions of existing lists and lists that claim to represent projects that do
                not have one.
              </p>
            </div>

          </div>

          <div className="flex flex-col gap-5">
            <Checkbox checked={checkedUnderstand} handleChange={() => setCheckedUnderstand(!checkedUnderstand)}
                      id="approve-list-import" label="I understand"/>
            <Button fullWidth size="regular" disabled={!checkedUnderstand} onClick={() => {
              addTokenList({
                name: tokenListToImport?.name,
                enabled: true,
                url: tokenListAddressToImport,
                id: "123"
              }, chainId as AvailableChains);
              setContent("default");
              addToast("List imported");
            }}>Import with URL
            </Button>
          </div>
        </>}
      </div>}

      {importType === "json" && <div className="flex flex-col flex-grow">

          <input
            type="file"
            onChange={(e) => handleFileChange(e)}
            style={{ display: "none" }}
            ref={fileInput}
          />
          <div className="flex items-center justify-between">
            <div className="w-[120px]">
              <Button size="regular" onClick={() => {
                if (fileInput.current && fileInput.current) {
                  fileInput.current.click()
                }
              }} variant="outline">Browse...</Button>
            </div>
            <p
              className="overflow-hidden overflow-ellipsis whitespace-nowrap w-[200px]">{tokenListFile?.name ? `${tokenListFile?.name}` :
              <span className="text-secondary-text">Select json file</span>}</p>
          </div>

          <h3 className="text-16 font-bold mt-5 mb-1">Please select JSON file to import</h3>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="mb-5 border-dashed border-green rounded-5 flex justify-center items-center h-[288px] border bg-secondary-bg flex-grow"
          >
            Import files or Drag & Drop
          </div>

        <Button fullWidth size="regular" onClick={() => {
          handleJSONImport();
          setContent("default");
          addToast("List imported");
        }}>Import with JSON
        </Button>
      </div>}
    </div>
  </>
}
