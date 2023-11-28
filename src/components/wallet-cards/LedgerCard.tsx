import PickButton from "@/components/atoms/PickButton";
import { wallets } from "@/config/wallets";
import { useConnect } from "wagmi";
import { LedgerConnector } from "@wagmi/connectors/ledger";
import usePreloaderTimeout from "@/hooks/usePreloader";

const { image, name } = wallets.ledger;
export default function LedgerCard() {
  const { connect, connectors, isLoading, isSuccess } = useConnect();

  const loading = usePreloaderTimeout({isLoading});

  return <PickButton onClick={() => connect({
    connector: connectors[2]
  })} image={image} label={name} isActive={isSuccess} loading={loading}/>
}
