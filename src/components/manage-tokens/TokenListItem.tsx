import clsx from "clsx";
import download from "downloadjs";
import Image from "next/image";
import { useState } from "react";

import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import Popover from "@/components/atoms/Popover";
import Svg from "@/components/atoms/Svg";
import Switch from "@/components/atoms/Switch";
import TokenListLogo, { TokenListLogoType } from "@/components/atoms/TokenListLogo";
import Button, { ButtonColor, ButtonVariant } from "@/components/buttons/Button";
import { db, TokenList } from "@/db/db";
import useCurrentChainId from "@/hooks/useCurrentChainId";

enum ListActionOption {
  VIEW,
  DOWNLOAD,
  REMOVE,
}

type Props =
  | {
      variant: ListActionOption.VIEW;
      href: string;
    }
  | {
      variant: ListActionOption.DOWNLOAD;
      handleDownload: () => void;
    }
  | {
      variant: ListActionOption.REMOVE;
      handleRemove: () => void;
    };

const commonClassName = "flex items-center gap-2 py-2 duration-200";
function ListPopoverOption(props: Props) {
  switch (props.variant) {
    case ListActionOption.DOWNLOAD:
      return (
        <button
          className={clsx(commonClassName, "text-primary-text hover:text-green-hover")}
          onClick={() => props.handleDownload()}
        >
          Download
          <Svg iconName="download" />
        </button>
      );
    case ListActionOption.REMOVE:
      return (
        <button
          className={clsx(commonClassName, "text-red hover:text-red-hover")}
          onClick={() => props.handleRemove()}
        >
          Remove
          <Svg iconName="delete" />
        </button>
      );
    case ListActionOption.VIEW:
      return (
        <a
          className={clsx(
            commonClassName,
            "text-green hover:text-green-hover opacity-50 pointer-events-none",
          )}
          href={props.href}
        >
          View list
          <Svg iconName="next" />
        </a>
      );
  }
}
export default function TokenListItem({
  tokenList,
  toggle,
}: {
  tokenList: TokenList;
  toggle: any;
}) {
  const [isPopoverOpened, setPopoverOpened] = useState(false);
  const [deleteOpened, setDeleteOpened] = useState(false);

  const chainId = useCurrentChainId();

  return (
    <div>
      <div className="flex justify-between py-1.5">
        <div className="flex gap-3 items-center">
          {tokenList?.id?.toString()?.startsWith("default") && (
            <TokenListLogo type={TokenListLogoType.DEFAULT} chainId={tokenList.chainId} />
          )}
          {tokenList?.id?.toString()?.startsWith("custom") && (
            <TokenListLogo type={TokenListLogoType.CUSTOM} chainId={tokenList.chainId} />
          )}
          {typeof tokenList.id === "number" && (
            <TokenListLogo type={TokenListLogoType.OTHER} url={tokenList.list.logoURI} />
          )}

          <div className="flex flex-col">
            <span>{tokenList.list.name}</span>
            <div className="flex gap-1 items-cente text-secondary-text">
              {tokenList.list.tokens.length} tokens
              <Popover
                placement="top"
                isOpened={isPopoverOpened}
                setIsOpened={() => setPopoverOpened(!isPopoverOpened)}
                customOffset={12}
                trigger={
                  <button
                    onClick={() => setPopoverOpened(true)}
                    className="text-secondary-text hover:text-primary-text duration-200 relative"
                  >
                    <Svg size={20} iconName="settings" />
                  </button>
                }
              >
                <div className="flex flex-col gap-1 px-5 py-3 border-secondary-border border bg-primary-bg rounded-1 shadow-popover">
                  <ListPopoverOption variant={ListActionOption.VIEW} href="#" />
                  <ListPopoverOption
                    variant={ListActionOption.DOWNLOAD}
                    handleDownload={async () => {
                      const blob = new Blob([JSON.stringify(tokenList.list, null, 2)], {
                        type: "application/json",
                      });

                      download(blob, tokenList.list.name, "application/json");
                    }}
                  />

                  {tokenList.id !== `default-${chainId}` && (
                    <>
                      <ListPopoverOption
                        variant={ListActionOption.REMOVE}
                        handleRemove={() => {
                          setDeleteOpened(true);
                        }}
                      />
                      <DrawerDialog isOpen={deleteOpened} setIsOpen={setDeleteOpened}>
                        <div className="w-full md:w-[600px]">
                          <DialogHeader
                            onClose={() => setDeleteOpened(false)}
                            title="Removing list"
                          />
                          <div className="px-4 pb-4 md:px-10 md:pb-10">
                            <Image
                              className="mx-auto mt-5 mb-2"
                              src={tokenList.list.logoURI || ""}
                              alt=""
                              width={60}
                              height={60}
                            />
                            <p className="mb-5 text-center">
                              Please confirm you would like to remove the
                              <b className="whitespace-nowrap">“{tokenList.list.name}”</b> list
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant={ButtonVariant.OUTLINED}
                                onClick={() => setDeleteOpened(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                colorScheme={ButtonColor.RED}
                                onClick={() => {
                                  db.tokenLists.delete(tokenList.id);
                                  setDeleteOpened(false);
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DrawerDialog>
                    </>
                  )}
                </div>
              </Popover>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={tokenList.enabled} handleChange={() => toggle(tokenList.id)} />
        </div>
      </div>
    </div>
  );
}
