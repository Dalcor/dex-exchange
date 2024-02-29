import { useState } from "react";
import Button from "@/components/atoms/Button";
import ManageTokensDialog from "@/components/manage-tokens/ManageTokensDialog";

export default function TokenListsSettings() {
  const [isOpened, setIsOpened] = useState(false);

  return <>
    <Button size="x-small" onClick={() => setIsOpened(true)} variant="outline">Manage tokens</Button>
    <ManageTokensDialog isOpen={isOpened} setIsOpen={setIsOpened} />
  </>
}
