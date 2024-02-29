import {
    useConnectWalletDialogStateStore,
    useConnectWalletStore
} from "@/components/dialogs/stores/useConnectWalletStore";
import usePreloaderTimeout from "@/hooks/usePreloader";
import PickButton from "@/components/atoms/PickButton";
import { wallets } from "@/config/wallets";
import addToast from "@/other/toast";
import { useConnect } from "wagmi";
import { rdnsMap } from "@/config/connectors/rdns";

const { image, name } = wallets.trustWallet;

export default function TrustWalletCard() {
    const { connectors, connectAsync, isPending } = useConnect();

    const { setName, chainToConnect } = useConnectWalletStore();
    const { setIsOpened } = useConnectWalletDialogStateStore()

    const loading = usePreloaderTimeout({ isLoading: isPending });

    return <PickButton onClick={() => {
        setName('trustWallet');
        const connectorToConnect = connectors.find(c => c.id === rdnsMap.trust);

        if(!connectorToConnect) {
            return addToast("Please, install Trust Wallet to proceed", "error");
        }

        connectAsync({
            connector: connectorToConnect,
            chainId: chainToConnect
        }).then(() => {
            setIsOpened(false);
            addToast("Successfully connected!")
        }).catch((e) => {
            console.log(e);
            if(e.code && e.code === 4001) {
                addToast("User rejected the request", "error");
            } else {
                addToast("Error: something went wrong", "error");
            }
        });
    }} image={image} label={name} loading={loading} />

}
