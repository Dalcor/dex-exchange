import { useCallback } from "react";
import { useConnect } from "wagmi";

import Button from "@/components/atoms/Button";
import Dialog from "@/components/atoms/Dialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import PickButton from "@/components/atoms/PickButton";
import {
  useConnectWalletDialogStateStore,
  useConnectWalletStore,
} from "@/components/dialogs/stores/useConnectWalletStore";
import CoinbaseCard from "@/components/wallet-cards/CoinbaseCard";
import KeystoreCard from "@/components/wallet-cards/KeystoreCard";
import MetamaskCard from "@/components/wallet-cards/MetamaskCard";
import TrustWalletCard from "@/components/wallet-cards/TrustWalletCard";
import WalletConnectCard from "@/components/wallet-cards/WalletConnectCard";
import { networks } from "@/config/networks";
import { config } from "@/config/wagmi/config";
import addToast from "@/other/toast";

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

function StepLabel({ step, label }: { step: string; label: string }) {
  return (
    <div className="flex gap-5 items-center">
      <span className="w-10 h-10 text-18 rounded-full bg-tertiary-bg flex items-center justify-center">
        {step}
      </span>
      <span className="text-18 font-bold">{label}</span>
    </div>
  );
}

export default function ConnectWalletDialog({ isOpen, setIsOpen }: Props) {
  const { chainToConnect, setChainToConnect } = useConnectWalletStore();

  return (
    <Dialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="min-w-[600px]">
        <DialogHeader onClose={() => setIsOpen(false)} title="Connect wallet" />
        <div className="p-10">
          <StepLabel step="1" label="Choose network" />
          <div className="grid grid-cols-4 gap-3 mt-3 mb-5">
            {networks.map(({ name, chainId, logo }) => {
              return (
                <PickButton
                  key={chainId}
                  isActive={chainId === chainToConnect}
                  onClick={() => {
                    setChainToConnect(chainId);
                  }}
                  image={logo}
                  label={name}
                />
              );
            })}
          </div>
          <StepLabel step="2" label="Choose wallet" />
          <div className="grid grid-cols-4 gap-3 mt-3">
            <MetamaskCard />
            <WalletConnectCard />
            <CoinbaseCard />
            <TrustWalletCard />
            <KeystoreCard />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
