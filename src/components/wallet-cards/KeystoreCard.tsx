import { useState } from "react";

import PickButton from "@/components/buttons/PickButton";
import KeystoreConnectDialog from "@/components/dialogs/KeystoreConnectDialog";
import { wallets } from "@/config/wallets";

const { image, name } = wallets.keystore;
export default function KeystoreCard() {
  const [isOpenKeystore, setIsOpenKeystore] = useState(false);

  return (
    <>
      <PickButton
        onClick={() => setIsOpenKeystore(true)}
        image={image}
        label={name}
        loading={isOpenKeystore}
      />

      <KeystoreConnectDialog isOpen={isOpenKeystore} setIsOpen={setIsOpenKeystore} />
    </>
  );
}
