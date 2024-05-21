import clsx from "clsx";
import { useState } from "react";

import Popover from "@/components/atoms/Popover";
import Svg from "@/components/atoms/Svg";
import Switch from "@/components/atoms/Switch";
import IconButton from "@/components/buttons/IconButton";
import { db, TokenList } from "@/db/db";

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
      href: string;
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
        <a
          className={clsx(commonClassName, "text-primary-text hover:text-green-hover")}
          href={props.href}
        >
          Download
          <Svg iconName="download" />
        </a>
      );
    case ListActionOption.REMOVE:
      return (
        <button
          className={clsx(commonClassName, "text-red hover:text-red-hover")}
          onClick={props.handleRemove}
        >
          Remove
          <Svg iconName="delete" />
        </button>
      );
    case ListActionOption.VIEW:
      return (
        <a className={clsx(commonClassName, "text-green hover:text-green-hover")} href={props.href}>
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
  const [open, setOpen] = useState(false);
  const [isPopoverOpened, setPopoverOpened] = useState(false);

  return (
    <div>
      <div className="flex justify-between py-1.5">
        <div className="flex gap-3 items-center">
          <img
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src = "/token-list-placeholder.svg";
            }}
            loading="lazy"
            width={40}
            height={40}
            className="w-10 h-10"
            src={tokenList.list.logoURI}
            alt=""
          />
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
                    href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(tokenList.list))}`}
                  />

                  {tokenList.id !== "default" && (
                    <ListPopoverOption
                      variant={ListActionOption.REMOVE}
                      handleRemove={() => db.tokenLists.delete(tokenList.id)}
                    />
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
