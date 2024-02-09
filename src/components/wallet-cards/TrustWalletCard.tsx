import { useConnectWalletStore } from "@/components/dialogs/stores/useConnectWalletStore";
import usePreloaderTimeout from "@/hooks/usePreloader";
import PickButton from "@/components/atoms/PickButton";
import { wallets } from "@/config/wallets";

const { image, name } = wallets.trustWallet;

export default function TrustWalletCard({isLoading}: {isLoading: boolean}) {
    // const { isLoading} = useConnect();

    const { walletName, setName } = useConnectWalletStore();
    const loading = usePreloaderTimeout({isLoading});

    return <PickButton onClick={() => setName('trustWallet')} image={image} label={name} loading={loading} isActive={walletName === "trustWallet"} />

}
