import { useState } from "react";

import Button, { ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import ManageTokensDialog from "@/components/manage-tokens/ManageTokensDialog";

export default function TokenListsSettings() {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <>
      <Button
        size={ButtonSize.SMALL}
        onClick={() => setIsOpened(true)}
        variant={ButtonVariant.OUTLINED}
      >
        Manage tokens
      </Button>
      <ManageTokensDialog isOpen={isOpened} setIsOpen={setIsOpened} />
    </>
  );
}
