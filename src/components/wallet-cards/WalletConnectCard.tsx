import PickButton from "@/components/atoms/PickButton";
import { wallets } from "@/config/wallets";
import { useConnect } from "wagmi";
import usePreloaderTimeout from "@/hooks/usePreloader";
import {
  useConnectWalletDialogStateStore,
  useConnectWalletStore
} from "@/components/dialogs/stores/useConnectWalletStore";
import addToast from "@/other/toast";

const { image, name } = wallets.wc;
export default function WalletConnectCard() {
  const { connectors, connectAsync, isPending } = useConnect();

  const { walletName, setName, chainToConnect } = useConnectWalletStore();
  const {setIsOpened} = useConnectWalletDialogStateStore()

  const loading = usePreloaderTimeout({isLoading: walletName === "wc" && isPending});

  return <PickButton onClick={() => {
    setName("wc");
    connectAsync({
      connector: connectors[0],
      chainId: chainToConnect
    }).then(() => {
      setIsOpened(false);
      addToast("Successfully connected!")
    }).catch((e) => {
      if(e.code && e.code === 4001) {
        addToast("User rejected the request", "error");
      } else {
        addToast("Error: something went wrong", "error");
      }
    });
  }} image={image} label={name} loading={loading} />
}
