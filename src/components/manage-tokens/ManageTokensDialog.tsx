import { useCallback, useState } from "react";

import DrawerDialog from "@/components/atoms/DrawerDialog";
import ImportList from "@/components/manage-tokens/ImportList";
import ImportToken from "@/components/manage-tokens/ImportToken";
import TokensAndLists from "@/components/manage-tokens/TokensAndLists";
import { ManageTokensDialogContent } from "@/components/manage-tokens/types";

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function ManageTokensDialog({ isOpen, setIsOpen }: Props) {
  const [content, setContent] = useState<ManageTokensDialogContent>("default");

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      {content === "default" && (
        <TokensAndLists setContent={setContent} handleClose={handleClose} />
      )}
      {content === "import-token" && (
        <ImportToken setContent={setContent} handleClose={handleClose} />
      )}
      {content === "import-list" && (
        <ImportList setContent={setContent} handleClose={handleClose} />
      )}
    </DrawerDialog>
  );
}
