import PickButton from "@/components/atoms/PickButton";
import { wallets } from "@/config/wallets";
import { useConnect } from "wagmi";
import usePreloaderTimeout from "@/hooks/usePreloader";
import { useConnectWalletStore } from "@/components/dialogs/stores/useConnectWalletStore";

const { image, name } = wallets.metamask;
export default function MetamaskCard({isLoading}: {isLoading: boolean}) {
  // const { isLoading} = useConnect();

  const { walletName, setName } = useConnectWalletStore();
  const loading = usePreloaderTimeout({isLoading});

  return <PickButton onClick={() => setName('metamask')} image={image} label={name} loading={loading} isActive={walletName === "metamask"} />
}
