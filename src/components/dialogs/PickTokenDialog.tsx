import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useCallback, useMemo, useState } from "react";

import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import { SearchInput } from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import IconButton from "@/components/buttons/IconButton";
import { TokenPortfolioDialogContent } from "@/components/dialogs/TokenPortfolioDialog";
import { formatFloat } from "@/functions/formatFloat";
import useTokenBalances from "@/hooks/useTokenBalances";
import { useTokens } from "@/hooks/useTokenLists";
import { Token } from "@/sdk_hybrid/entities/token";
import { useManageTokensDialogStore } from "@/stores/useManageTokensDialogStore";
import { usePinnedTokensStore } from "@/stores/usePinnedTokensStore";

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handlePick: (token: Token) => void;
}

function TokenRow({
  token,
  handlePick,
  setTokenForPortfolio,
}: {
  token: Token;
  handlePick: (token: Token) => void;
  setTokenForPortfolio: (token: Token) => void;
}) {
  const { toggleToken, isTokenPinned, pinnedTokens } = usePinnedTokensStore((s) => ({
    toggleToken: s.toggleToken,
    pinnedTokens: s.tokens,
    isTokenPinned: s.tokens[token.chainId]?.includes(token.address0),
  }));

  const {
    balance: { erc20Balance, erc223Balance },
  } = useTokenBalances(isTokenPinned ? token : undefined);

  return (
    <div
      role="button"
      onClick={() => handlePick(token)}
      className="px-10 flex justify-between py-2 hover:bg-tertiary-bg duration-200"
    >
      <div className="flex items-center gap-3 flex-grow">
        <Image width={40} height={40} src={token?.logoURI || ""} alt="" />
        <div className="grid flex-grow">
          <span>{token.symbol}</span>
          <div className="auto-cols-fr grid grid-flow-col gap-2">
            {erc20Balance && (
              <div className="flex items-center gap-1">
                <Badge size="small" variant={BadgeVariant.COLORED} text="ERC-20" />
                <span className="text-secondary-text text-12">
                  {formatFloat(erc20Balance?.formatted)} {token.symbol}
                </span>
              </div>
            )}
            {erc223Balance && (
              <div className="flex items-center gap-1">
                <Badge size="small" variant={BadgeVariant.COLORED} text="ERC-223" />
                <span className="text-secondary-text text-12">
                  {formatFloat(erc223Balance?.formatted)} {token.symbol}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span>$0.00</span>
        <IconButton
          iconName="details"
          onClick={(e) => {
            e.stopPropagation();
            setTokenForPortfolio(token);
          }}
        />
        <IconButton
          className={clsx("duration-200", isTokenPinned ? "text-green" : "hover:text-green")}
          iconName={isTokenPinned ? "pin-fill" : "pin"}
          onClick={(e) => {
            e.stopPropagation();
            toggleToken(token.address0, token.chainId);
          }}
        />
      </div>
    </div>
  );
}

export default function PickTokenDialog({ isOpen, setIsOpen, handlePick }: Props) {
  const tokens = useTokens();
  const t = useTranslations("ManageTokens");

  const [tokenForPortfolio, setTokenForPortfolio] = useState<Token | null>(null);
  const { isOpen: isManageOpened, setIsOpen: setManageOpened } = useManageTokensDialogStore();

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setTokenForPortfolio(null);
    }, 400);
  }, [setIsOpen]);

  const [tokensSearchValue, setTokensSearchValue] = useState("");

  const [filteredTokens, isTokenFilterActive] = useMemo(() => {
    return tokensSearchValue
      ? [
          tokens.filter(
            (t) => t.name && t.name.toLowerCase().startsWith(tokensSearchValue.toLowerCase()),
          ),
          true,
        ]
      : [tokens, false];
  }, [tokens, tokensSearchValue]);

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={handleClose}>
      {tokenForPortfolio ? (
        <>
          <DialogHeader
            onClose={handleClose}
            onBack={() => {
              setTokenForPortfolio(null);
            }}
            title={tokenForPortfolio.name || "Unknown"}
          />
          <TokenPortfolioDialogContent token={tokenForPortfolio} />
        </>
      ) : (
        <>
          <DialogHeader onClose={handleClose} title={t("select_token")} />

          {Boolean(tokens.length) && (
            <>
              <div className="w-full md:w-[600px]">
                <div className="px-4 md:px-10 pb-3">
                  <SearchInput
                    value={tokensSearchValue}
                    onChange={(e) => setTokensSearchValue(e.target.value)}
                    placeholder={t("search_name_or_paste_address")}
                  />
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <button className="opacity-50 pointer-events-none items-center justify-center duration-200 h-10 rounded-1 border border-primary-border hover:border-green flex gap-2">
                      <Image width={24} height={24} src="/tokens/ETH.svg" alt="" />
                      ETH
                    </button>
                    <button className="opacity-50 pointer-events-none items-center justify-center duration-200 h-10 rounded-1 border border-primary-border hover:border-green flex gap-2">
                      <Image width={24} height={24} src="/tokens/USDT.svg" alt="" />
                      USDT
                    </button>
                    <button className="opacity-50 pointer-events-none items-center justify-center duration-200 h-10 rounded-1 border border-primary-border hover:border-green flex gap-2">
                      <Image width={24} height={24} src="/tokens/DEX.svg" alt="" />
                      DEX223
                    </button>
                  </div>
                </div>
                {Boolean(filteredTokens.length) && (
                  <div className="h-[420px] overflow-auto">
                    {filteredTokens.map((token) => (
                      <TokenRow
                        setTokenForPortfolio={setTokenForPortfolio}
                        handlePick={handlePick}
                        key={token.address0}
                        token={token}
                      />
                    ))}
                  </div>
                )}
                {Boolean(!filteredTokens.length && isTokenFilterActive) && (
                  <div className="flex items-center justify-center gap-2 flex-col h-full min-h-[420px] w-full md:w-[570px]">
                    <EmptyStateIcon iconName="search" />
                    <span className="text-secondary-text">{t("token_not_found")}</span>
                  </div>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setManageOpened(true);
                  }}
                  className="w-full text-green hover:text-green-hover rounded-b-5 flex items-center justify-center gap-2 h-[60px] bg-tertiary-bg hover:bg-green-bg hover:shadow-checkbox duration-200"
                >
                  Manage tokens
                  <Svg iconName="edit" />
                </button>
              </div>
            </>
          )}
          {Boolean(!tokens.length) && (
            <div className="flex items-center justify-center gap-2 flex-col h-full min-h-[520px] w-full md:w-[570px]">
              <EmptyStateIcon iconName="tokens" />
              <span className="text-secondary-text">{t("no_tokens_here")}</span>
            </div>
          )}
        </>
      )}
    </DrawerDialog>
  );
}
