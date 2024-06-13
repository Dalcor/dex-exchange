import { useTranslations } from "next-intl";
import { useConnect } from "wagmi";

import PickButton from "@/components/buttons/PickButton";
import {
  useConnectWalletDialogStateStore,
  useConnectWalletStore,
} from "@/components/dialogs/stores/useConnectWalletStore";
import { rdnsMap } from "@/config/connectors/rdns";
import { wallets } from "@/config/wallets";
import usePreloaderTimeout from "@/hooks/usePreloader";
import addToast from "@/other/toast";

const { image, name } = wallets.metamask;
export default function MetamaskCard() {
  const t = useTranslations("Wallet");
  const { connectors, connectAsync, isPending } = useConnect();

  const { setName, chainToConnect } = useConnectWalletStore();
  const { setIsOpened } = useConnectWalletDialogStateStore();

  const loading = usePreloaderTimeout({ isLoading: isPending });

  return (
    <PickButton
      onClick={() => {
        setName("metamask");
        console.log(connectors);
        const connectorToConnect = connectors[2];

        if (!connectorToConnect) {
          return addToast(t("install_metamask"), "error");
        }

        connectAsync({
          connector: connectorToConnect,
          chainId: chainToConnect,
        })
          .then(() => {
            setIsOpened(false);
            addToast(t("successfully_connected"));
          })
          .catch((e) => {
            if (e.code && e.code === 4001) {
              addToast(t("user_rejected"), "error");
            } else {
              addToast(t("something_went_wrong"), "error");
            }
          });
      }}
      image={image}
      label={name}
      loading={loading}
    />
  );
}
