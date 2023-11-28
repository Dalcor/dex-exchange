import PickButton from "@/components/atoms/PickButton";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { wallets } from "@/config/wallets";
import { useConnect } from "wagmi";
import usePreloaderTimeout from "@/hooks/usePreloader";

const { image, name } = wallets.wc;
export default function WalletConnectCard() {
  // const { open } = useWeb3Modal();
  const {connect, connectors, isLoading, isSuccess} = useConnect();

  const loading = usePreloaderTimeout({isLoading});

  return <PickButton onClick={() => connect({
    connector: connectors[1]
  })} image={image} label={name} loading={loading} isActive={isSuccess} />
}
