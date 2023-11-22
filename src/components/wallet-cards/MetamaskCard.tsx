import PickButton from "@/components/atoms/PickButton";
import { wallets } from "@/config/wallets";
import { useConnect } from "wagmi";
import { MetaMaskConnector } from "@wagmi/connectors/metaMask";

const { image, name } = wallets.metamask;
export default function MetamaskCard() {
  const { connect } = useConnect({
    connector: new MetaMaskConnector()
  });

  return <PickButton onClick={connect} image={image} label={name}/>
}
