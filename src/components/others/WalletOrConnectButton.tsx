import { ForwardedRef, forwardRef } from "react";
import { useAccount, useDisconnect } from "wagmi";

import SelectButton from "@/components/atoms/SelectButton";
import Svg from "@/components/atoms/Svg";
import Button from "@/components/buttons/Button";
import ClientOnly from "@/components/others/ClientOnly";

interface Props {
  openWallet: (isOpen: boolean) => void;
  openAccount: (isOpen: boolean) => void;
}

export const WalletOrConnectButton = forwardRef(
  ({ openWallet, openAccount }: Props, ref: ForwardedRef<HTMLButtonElement>) => {
    const { address, isConnected, isConnecting } = useAccount();

    return (
      <>
        {isConnected && address ? (
          <SelectButton ref={ref} withArrow={false} onClick={() => openAccount(true)}>
            <span className="flex gap-2 items-center px-3">
              <Svg iconName="wallet" />
              {`${address.slice(0, 5)}...${address.slice(-3)}`}
            </span>
          </SelectButton>
        ) : (
          <Button size="small" onClick={() => openWallet(true)}>
            Connect wallet
          </Button>
        )}
      </>
    );
  },
);

WalletOrConnectButton.displayName = "WalletOrConnectButton";

export default WalletOrConnectButton;
