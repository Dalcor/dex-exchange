import Dialog from "@/components/atoms/Dialog";
import { ChangeEvent, useState } from "react";
import PickButton from "@/components/atoms/PickButton";
import { networks } from "@/config/networks";
import { wallets } from "@/config/wallets";
import DialogHeader from "@/components/atoms/DialogHeader";
import { MetaMaskConnector } from "@wagmi/connectors/metaMask";
import { useConnect } from "wagmi";
import MetamaskCard from "@/components/wallet-cards/MetamaskCard";
import WalletConnectCard from "@/components/wallet-cards/WalletConnectCard";
import LedgerCard from "@/components/wallet-cards/LedgerCard";
import KeystoreCard from "@/components/wallet-cards/KeystoreCard";


interface Props {
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void
}

function StepLabel({step, label}: { step: string, label: string }) {
  return <div className="flex gap-5 items-center">
    <span className="w-10 h-10 text-18 rounded-full bg-table-fill flex items-center justify-center">
      {step}
    </span>
    <span className="text-18 font-bold">{label}</span>
  </div>
}

export default function ConnectWalletDialog({isOpen, setIsOpen}: Props) {
  const [activeNetwork, setActiveNetwork] = useState(1);

  return <Dialog isOpen={isOpen} setIsOpen={setIsOpen}>
    <div className="min-w-[600px]">
      <DialogHeader onClose={() => setIsOpen(false)} title="Connect wallet" />
      <div className="p-10">
        <StepLabel step="1" label="Choose network" />
        <div className="grid grid-cols-4 gap-3 mt-3 mb-5">
          {networks.map(({name, chainId, logo}) => {
            return <PickButton key={chainId} isActive={chainId === activeNetwork} onClick={() => {
              setActiveNetwork(chainId);
            }} image={logo} label={name} />
          })}
        </div>
        <StepLabel step="2" label="Choose wallet" />
        <div className="grid grid-cols-4 gap-3 mt-3">
          <MetamaskCard />
          <WalletConnectCard />
          <LedgerCard />
          <KeystoreCard />
        </div>
      </div>
    </div>
  </Dialog>
}
