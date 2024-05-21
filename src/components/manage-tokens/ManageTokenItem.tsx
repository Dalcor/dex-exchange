import Image from "next/image";
import { useState } from "react";

import Dialog from "@/components/atoms/Dialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import Svg from "@/components/atoms/Svg";
import IconButton, {
  IconButtonSize,
  IconButtonVariant,
  IconSize,
} from "@/components/buttons/IconButton";
import { db } from "@/db/db";
import { useTokenLists } from "@/hooks/useTokenLists";
import { Token } from "@/sdk_hybrid/entities/token";

export default function ManageTokenItem({ token }: { token: Token }) {
  const [open, setOpen] = useState(false);
  const [deleteOpened, setDeleteOpened] = useState(false);

  const tokenLists = useTokenLists();

  return (
    <div className="group">
      <div className="flex justify-between py-1.5">
        <div className="flex gap-3 items-center">
          <img className="rounded-full" width={40} height={40} src={token.logoURI} alt="" />
          <div className="flex flex-col">
            <span>{token.name}</span>
            <span className="text-secondary-text">{token.symbol}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {token.lists?.includes("custom") && (
            <div className="group-hover:opacity-100 opacity-0 duration-200">
              <IconButton
                variant={IconButtonVariant.DELETE}
                handleDelete={() => setDeleteOpened(true)}
              />
              <Dialog isOpen={deleteOpened} setIsOpen={setDeleteOpened}>
                <DialogHeader onClose={() => setDeleteOpened(false)} title="Remove token" />
                Are you sure you want delete this token? It will be removed only from your custom
                token list.
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setDeleteOpened(false)}>Cancel</button>
                  <button
                    onClick={async () => {
                      const currentCustomTokens = await db.tokenLists.get("custom");

                      if (currentCustomTokens) {
                        await (db.tokenLists as any).update("custom", {
                          "list.tokens": currentCustomTokens.list.tokens.filter(
                            (t) => t.address0 !== token.address0,
                          ),
                        });
                      }
                      setDeleteOpened(false);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </Dialog>
            </div>
          )}
          <span className="flex gap-0.5 items-center text-secondary-text text-14">
            {token.lists?.length || 1}
            <Svg className="text-tertiary-text" iconName="list" />
          </span>

          <IconButton onClick={() => setOpen(!open)} iconName="details" />
        </div>
      </div>
      <Dialog isOpen={open} setIsOpen={setOpen}>
        <div className="px-5 pt-3 w-[530px]">
          <div className="border-b border-primary-border pb-3 flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-secondary-text">Name</span>
              <span>{token.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-text">Symbol</span>
              <span>{token.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-text">Address</span>
              <span>{token.address0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-text">Decimals</span>
              <span>{token.decimals}</span>
            </div>
          </div>
          <p className="pt-3 text-secondary-text">Found in these token-lists:</p>
          <div className="flex flex-col gap-3 py-3">
            {token.lists?.map((listId) => {
              return (
                <div className="flex gap-3 items-center" key={listId}>
                  <div className="px-2">
                    <Image
                      width={32}
                      height={32}
                      src={tokenLists?.find((tl) => tl.id === listId)?.list.logoURI || ""}
                      alt=""
                    />
                  </div>
                  {tokenLists?.find((tl) => tl.id === listId)?.list.name || ""}
                </div>
              );
            })}
          </div>
        </div>
      </Dialog>
    </div>
  );
}
