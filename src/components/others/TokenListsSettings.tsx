import { useState } from "react";

import SelectButton from "@/components/atoms/SelectButton";
import Button, { ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import ManageTokensDialog from "@/components/manage-tokens/ManageTokensDialog";

export default function TokenListsSettings() {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <div className="hidden md:block">
      <SelectButton withArrow={false} size="regular" onClick={() => setIsOpened(true)}>
        Manage tokens
      </SelectButton>
      <ManageTokensDialog isOpen={isOpened} setIsOpen={setIsOpened} />
    </div>
  );
}
