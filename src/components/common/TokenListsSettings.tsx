import { useState } from "react";

import SelectButton from "@/components/atoms/SelectButton";
import ManageTokensDialog from "@/components/manage-tokens/ManageTokensDialog";

export default function TokenListsSettings() {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <div>
      <SelectButton
        className="py-1 xl:py-2 text-14 xl:text-16 min-h-8 w-full md:w-auto flex items-center justify-center"
        withArrow={false}
        size="regular"
        onClick={() => setIsOpened(!isOpened)}
      >
        Manage tokens
      </SelectButton>
      <ManageTokensDialog isOpen={isOpened} setIsOpen={setIsOpened} />
    </div>
  );
}
