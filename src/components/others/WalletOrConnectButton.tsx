import { ForwardedRef, forwardRef } from "react";
import { useAccount } from "wagmi";

import SelectButton from "@/components/atoms/SelectButton";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonSize } from "@/components/buttons/Button";

interface Props {
  openWallet: (isOpen: boolean) => void;
  openAccount: (isOpen: boolean) => void;
  fullWidth?: boolean;
}

export const WalletOrConnectButton = forwardRef(
  ({ openWallet, openAccount, fullWidth }: Props, ref: ForwardedRef<HTMLButtonElement>) => {
    const { address, isConnected, isConnecting } = useAccount();

    return (
      <>
        {isConnected && address ? (
          <SelectButton
            fullWidth={fullWidth}
            ref={ref}
            withArrow={false}
            onClick={() => openAccount(true)}
          >
            <span className="flex gap-2 items-center px-3">
              <Svg iconName="wallet" />
              {`${address.slice(0, 5)}...${address.slice(-3)}`}
            </span>
          </SelectButton>
        ) : (
          <Button fullWidth={fullWidth} size={ButtonSize.MEDIUM} onClick={() => openWallet(true)}>
            Connect wallet
          </Button>
        )}
      </>
    );
  },
);

WalletOrConnectButton.displayName = "WalletOrConnectButton";

export default WalletOrConnectButton;
