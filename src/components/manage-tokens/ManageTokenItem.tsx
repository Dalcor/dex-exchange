import Image from "next/image";
import { useMemo, useState } from "react";

import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonColor, ButtonVariant } from "@/components/buttons/Button";
import IconButton, { IconButtonVariant } from "@/components/buttons/IconButton";
import { db } from "@/db/db";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { Token } from "@/sdk_hybrid/entities/token";

export default function ManageTokenItem({
  token,
  setTokenForPortfolio,
}: {
  token: Token;
  setTokenForPortfolio: (token: Token) => void;
}) {
  const [open, setOpen] = useState(false);
  const [deleteOpened, setDeleteOpened] = useState(false);

  const chainId = useCurrentChainId();

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
          {token.lists?.includes(`custom-${chainId}`) && (
            <div className="group-hover:opacity-100 opacity-0 duration-200">
              <IconButton
                variant={IconButtonVariant.DELETE}
                handleDelete={() => setDeleteOpened(true)}
              />
              <DrawerDialog isOpen={deleteOpened} setIsOpen={setDeleteOpened}>
                <div className="w-full md:w-[600px]">
                  <DialogHeader
                    onClose={() => setDeleteOpened(false)}
                    title="Removing custom token"
                  />
                  <div className="px-4 pb-4 md:px-10 md:pb-10">
                    <Image
                      className="mx-auto mt-5 mb-2"
                      src={token.logoURI || ""}
                      alt=""
                      width={60}
                      height={60}
                    />
                    <p className="mb-5 text-center">
                      Please confirm you would like to remove the{" "}
                      <b className="whitespace-nowrap">“{token.name}”</b> custom token. It will be
                      removed only from custom list.
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
                        onClick={async () => {
                          const currentCustomTokens = await db.tokenLists.get(`custom-${chainId}`);

                          if (currentCustomTokens) {
                            await (db.tokenLists as any).update(`custom-${chainId}`, {
                              "list.tokens": currentCustomTokens.list.tokens.filter(
                                (t) => t.address0 !== token.address0,
                              ),
                            });
                          }
                          setDeleteOpened(false);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </DrawerDialog>
            </div>
          )}
          <span className="flex gap-0.5 items-center text-secondary-text text-14">
            {token.lists?.length || 1}
            <Svg className="text-tertiary-text" iconName="list" />
          </span>

          <IconButton onClick={() => setTokenForPortfolio(token)} iconName="details" />
        </div>
      </div>
    </div>
  );
}
