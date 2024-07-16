import { useCallback, useState } from "react";

import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import { TokenPortfolioDialogContent } from "@/components/dialogs/TokenPortfolioDialog";
import ImportList from "@/components/manage-tokens/ImportList";
import ImportToken from "@/components/manage-tokens/ImportToken";
import TokensAndLists from "@/components/manage-tokens/TokensAndLists";
import { ManageTokensDialogContent } from "@/components/manage-tokens/types";
import { Token } from "@/sdk_hybrid/entities/token";
import { useManageTokensDialogStore } from "@/stores/useManageTokensDialogStore";

export default function ManageTokensDialog() {
  const { isOpen, setIsOpen } = useManageTokensDialogStore();

  const [content, setContent] = useState<ManageTokensDialogContent>("default");
  const [tokenForPortfolio, setTokenForPortfolio] = useState<Token | null>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setContent("default");
      setTokenForPortfolio(null);
    }, 400);
  }, [setIsOpen]);

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="z-[1000]">
        {content === "default" && (
          <TokensAndLists
            setTokenForPortfolio={(token: Token) => {
              setTokenForPortfolio(token);
              setContent("token-portfolio");
            }}
            setContent={setContent}
            handleClose={handleClose}
          />
        )}
        {content === "import-token" && (
          <ImportToken setContent={setContent} handleClose={handleClose} />
        )}
        {content === "import-list" && (
          <ImportList setContent={setContent} handleClose={handleClose} />
        )}
        {content === "token-portfolio" && tokenForPortfolio && (
          <>
            <DialogHeader
              onClose={handleClose}
              onBack={() => {
                setContent("default");
                setTokenForPortfolio(null);
              }}
              title={tokenForPortfolio.name || "Unknown"}
            />
            <TokenPortfolioDialogContent token={tokenForPortfolio} />
          </>
        )}
      </div>
    </DrawerDialog>
  );
}
