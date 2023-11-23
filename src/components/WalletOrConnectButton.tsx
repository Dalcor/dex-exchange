import SelectButton from "@/components/atoms/SelectButton";
import Svg from "@/components/atoms/Svg";
import Button from "@/components/atoms/Button";
import { useAccount, useDisconnect } from "wagmi";
import ClientOnly from "@/components/ClientOnly";

interface Props {
  openWallet: (isOpen: boolean) => void,
  openAccount: (isOpen: boolean) => void,
}
export default function WalletOrConnectButton({openWallet, openAccount}: Props) {
  const { address, isConnected, isConnecting } = useAccount();

  console.log(isConnected);
  console.log(address);

  return <ClientOnly>
    {isConnected && address
      ? <SelectButton withArrow={false} onClick={() => openAccount(true)}>
              <span className="flex gap-2 items-center px-3">
                <Svg iconName="wallet"/>
                {`${address.slice(0, 5)}...${address.slice(-3)}`}
              </span>
      </SelectButton>
      : <Button size="small" onClick={() => openWallet(true)}>Connect wallet</Button>
    }
  </ClientOnly>
}
