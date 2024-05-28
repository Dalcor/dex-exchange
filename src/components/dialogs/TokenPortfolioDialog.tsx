import { useMemo } from "react";

import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import ExternalTextLink from "@/components/atoms/ExternalTextLink";
import TokenListLogo, { TokenListLogoType } from "@/components/atoms/TokenListLogo";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import IconButton, {
  IconButtonSize,
  IconButtonVariant,
  IconSize,
} from "@/components/buttons/IconButton";
import { useTokenPortfolioDialogStore } from "@/components/dialogs/stores/useTokenPortfolioDialogStore";
import { TokenListId } from "@/db/db";
import { copyToClipboard } from "@/functions/copyToClipboard";
import { useTokenLists } from "@/hooks/useTokenLists";
import addToast from "@/other/toast";
import { Token } from "@/sdk_hybrid/entities/token";

function TokenListInfo({ listId }: { listId: TokenListId }) {
  const tokenLists = useTokenLists();

  const tokenList = useMemo(() => {
    return tokenLists?.find((tl) => tl.id === listId);
  }, [listId, tokenLists]);

  return (
    <div className="flex justify-between w-full">
      <div className="flex gap-3 items-center">
        {tokenList?.id?.toString()?.startsWith("default") && (
          <TokenListLogo type={TokenListLogoType.DEFAULT} chainId={tokenList.chainId} />
        )}
        {tokenList?.id?.toString()?.startsWith("custom") && (
          <TokenListLogo type={TokenListLogoType.CUSTOM} chainId={tokenList.chainId} />
        )}
        {typeof tokenList?.id === "number" && (
          <TokenListLogo type={TokenListLogoType.OTHER} url={tokenList.list.logoURI} />
        )}

        <div className="flex flex-col">
          <span>{tokenList?.list.name}</span>
          <div className="flex gap-1 items-cente text-secondary-text">
            {tokenList?.list.tokens.length} tokens
          </div>
        </div>
      </div>
      <ExternalTextLink text="View list" href="#" />
    </div>
  );
}

export function TokenPortfolioDialogContent({ token }: { token: Token }) {
  return (
    <div className="w-full md:w-[600px]">
      <div className="px-4 pb-5 md:px-10 border-b border-primary-border flex flex-col gap-2">
        <div className="flex justify-between">
          <span className="text-secondary-text">Symbol</span>
          <span>{token.symbol}</span>
        </div>
        <div className="grid grid-cols-[1fr_auto_32px] gap-x-2">
          <span className="text-secondary-text flex items-center gap-1">
            Address <Badge variant={BadgeVariant.COLORED} text="ERC-20" />{" "}
          </span>
          <ExternalTextLink
            color="white"
            text={`${token.address0.slice(0, 6)}...${token.address0.slice(-6)}`}
            href={""}
            className="justify-between"
          />
          <IconButton
            iconSize={IconSize.SMALL}
            variant={IconButtonVariant.DEFAULT}
            buttonSize={IconButtonSize.SMALL}
            iconName="copy"
            onClick={async () => {
              await copyToClipboard(token.address0);
              addToast("Successfully copied!");
            }}
          />
          <span className="text-secondary-text flex items-center gap-1">
            Address <Badge variant={BadgeVariant.COLORED} text="ERC-223" />{" "}
          </span>
          <ExternalTextLink
            color="white"
            text={`${token.address1.slice(0, 6)}...${token.address1.slice(-6)}`}
            href={""}
            className="justify-between"
          />
          <IconButton
            iconSize={IconSize.SMALL}
            variant={IconButtonVariant.DEFAULT}
            buttonSize={IconButtonSize.SMALL}
            iconName="copy"
            onClick={async () => {
              await copyToClipboard(token.address1);
              addToast("Successfully copied!");
            }}
          />
        </div>
        <div className="flex justify-between">
          <span className="text-secondary-text">Decimals</span>
          <span>{token.decimals}</span>
        </div>
      </div>
      <p className="text-secondary-text px-4 md:px-10 py-3">
        Found in {token.lists?.length} token-list
        {token.lists?.length.toString().endsWith("1") ? "" : "s"}:
      </p>
      <div className="flex flex-col gap-3 pb-4 md:pb-10 px-4 md:px-10">
        {token.lists?.map((listId) => {
          return (
            <div className="flex gap-3 items-center justify-between" key={listId}>
              <TokenListInfo listId={listId} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TokenPortfolioDialog() {
  const { token, isOpen, handleClose } = useTokenPortfolioDialogStore();

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={handleClose}>
      <DialogHeader onClose={handleClose} title={token?.name || "Unknown"} />
      {token && <TokenPortfolioDialogContent token={token} />}
    </DrawerDialog>
  );
}
