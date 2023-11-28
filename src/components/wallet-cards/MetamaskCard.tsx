import PickButton from "@/components/atoms/PickButton";
import { wallets } from "@/config/wallets";
import { useConnect } from "wagmi";
import usePreloaderTimeout from "@/hooks/usePreloader";

const { image, name } = wallets.metamask;
export default function MetamaskCard() {
  const { connect, isLoading, isSuccess, connectors } = useConnect();


  const loading = usePreloaderTimeout({isLoading});

  return <PickButton onClick={() => connect({connector: connectors[0]})} image={image} label={name} loading={loading} isActive={isSuccess} />
}
