import PickButton from "@/components/atoms/PickButton";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { wallets } from "@/config/wallets";

const { image, name } = wallets.wc;
export default function WalletConnectCard() {
  const { open } = useWeb3Modal();

  return <PickButton onClick={open} image={image} label={name}/>
}
