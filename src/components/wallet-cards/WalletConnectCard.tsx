import PickButton from "@/components/atoms/PickButton";
import { wallets } from "@/config/wallets";
import { useConnect } from "wagmi";
import usePreloaderTimeout from "@/hooks/usePreloader";
import { useConnectWalletStore } from "@/components/dialogs/stores/useConnectWalletStore";
import addToast from "@/other/toast";

const { image, name } = wallets.wc;
export default function WalletConnectCard() {
  const { isSuccess} = useConnect();

  const loading = usePreloaderTimeout({isLoading: false});
  const { setName, walletName } = useConnectWalletStore();

  return <PickButton onClick={() => {
    setName("wc");
    // addToast("Access via WalletConnect will be added soon", "info");
  }} image={image} label={name} loading={loading} isActive={walletName === "wc"} />
}
