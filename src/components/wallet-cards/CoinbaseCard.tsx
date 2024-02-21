import PickButton from "@/components/atoms/PickButton";
import { wallets } from "@/config/wallets";
import usePreloaderTimeout from "@/hooks/usePreloader";
import { useConnectWalletStore } from "@/components/dialogs/stores/useConnectWalletStore";

const { image, name } = wallets.coinbase;
export default function CoinbaseCard({isLoading}: {isLoading: boolean}) {
  // const { isLoading} = useConnect();

  const { walletName, setName } = useConnectWalletStore();
  const loading = usePreloaderTimeout({isLoading});

  return <PickButton onClick={() => setName('coinbase')} image={image} label={name} loading={loading} isActive={walletName === "coinbase"} />
}
