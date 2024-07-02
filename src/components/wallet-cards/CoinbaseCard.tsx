import { useTranslations } from "next-intl";
import { useConnect } from "wagmi";

import PickButton from "@/components/buttons/PickButton";
import {
  useConnectWalletDialogStateStore,
  useConnectWalletStore,
} from "@/components/dialogs/stores/useConnectWalletStore";
import { rdnsMap } from "@/config/connectors/rdns";
import { config } from "@/config/wagmi/config";
import { wallets } from "@/config/wallets";
import usePreloaderTimeout from "@/hooks/usePreloader";
import addToast from "@/other/toast";

const { image, name } = wallets.coinbase;
export default function CoinbaseCard() {
  const t = useTranslations("Wallet");
  const { connectors, connectAsync, isPending } = useConnect();

  const { setName, chainToConnect } = useConnectWalletStore();
  const { setIsOpened } = useConnectWalletDialogStateStore();

  const loading = usePreloaderTimeout({ isLoading: isPending });

  return (
    <PickButton
      onClick={() => {
        setName("coinbase");
        const connectorToConnect = connectors.find((c) => c.id === rdnsMap.coinbase);

        if (!connectorToConnect) {
          return addToast(t("install_coinbase"), "error");
        }

        connectAsync({
          connector: connectors[3],
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
