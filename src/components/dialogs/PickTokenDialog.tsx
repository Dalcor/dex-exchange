import clsx from "clsx";
import Image from "next/image";
import React, { useCallback, useState } from "react";

import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Input from "@/components/atoms/Input";
import IconButton from "@/components/buttons/IconButton";
import { TokenPortfolioDialogContent } from "@/components/dialogs/TokenPortfolioDialog";
import { useTokens } from "@/hooks/useTokenLists";
import addToast from "@/other/toast";
import { Token } from "@/sdk_hybrid/entities/token";
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
    isTokenPinned: s.tokens[token.chainId].includes(token.address0),
  }));

  return (
    <div
      role="button"
      onClick={() => handlePick(token)}
      className="px-10 flex justify-between py-2"
    >
      <div className="flex items-center gap-3">
        <Image width={40} height={40} src={token?.logoURI || ""} alt="" />
        <div className="grid">
          <span>{token.symbol}</span>
          <span className="text-secondary-text text-12">0.00 {token.symbol}</span>
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

  const [tokenForPortfolio, setTokenForPortfolio] = useState<Token | null>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setTokenForPortfolio(null);
    }, 400);
  }, [setIsOpen]);

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
          <DialogHeader onClose={handleClose} title="Select a token" />

          {tokens.length ? (
            <>
              <div className="w-full md:w-[570px]">
                <div className="px-4 md:px-10 pb-3">
                  <Input placeholder="Search name or paste address" />
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
                <div className="h-[420px] overflow-scroll">
                  {tokens.map((token) => (
                    <TokenRow
                      setTokenForPortfolio={setTokenForPortfolio}
                      handlePick={handlePick}
                      key={token.address0}
                      token={token}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 flex-col h-full min-h-[520px] w-full md:w-[570px]">
              <EmptyStateIcon iconName="tokens" />
              <span className="text-secondary-text">There are no tokens here</span>
            </div>
          )}
        </>
      )}
    </DrawerDialog>
  );
}
