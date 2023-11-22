import Dialog from "@/components/atoms/Dialog";
import { ChangeEvent, useState } from "react";
import PickButton from "@/components/atoms/PickButton";
import { networks } from "@/config/networks";
import { wallets } from "@/config/wallets";
import DialogHeader from "@/components/atoms/DialogHeader";
import { MetaMaskConnector } from "@wagmi/connectors/metaMask";
import { useAccount, useConnect } from "wagmi";
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { LedgerConnector } from "@wagmi/connectors/ledger";
import { KeystoreConnector } from "@/config/connectors/keystore/connector";
import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import Button from "@/components/atoms/Button";
import { getWalletFromPrivKeyFile } from "@/functions/keystore";

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

const unlockKeystore = async (file: {[key: string]: string} | null, password: string) => {
  const newFile: {[key: string]: string} = {};

  if(!file) {
    return;
  }
  // Small hack because non-strict wasn't working..
  Object.keys(file).forEach(key => {
    newFile[key.toLowerCase()] = file[key];
  });

  return getWalletFromPrivKeyFile(newFile, password);
};

export default function ConnectWalletDialog({isOpen, setIsOpen}: Props) {
  const [activeNetwork, setActiveNetwork] = useState(1);

  const { connect: connectMetamask } = useConnect({
    connector: new MetaMaskConnector()
  });

  const {connect: connectLedger} = useConnect({
    connector: new LedgerConnector({
      options: {
        projectId: "05737c557c154bdb3aea937d7214eae2"
      }
    })
  })

  const { open } = useWeb3Modal();


  const [isOpenKeystore, setIsOpenKeystore] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [keystore, setKeystore] = useState<{[key: string]: string} | null>(null);
  const [isUnlockingKeystore, setIsUnlockingKeystore] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setFileError(null);
    const file = event?.target?.files?.[0];

    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if(e.target) {
            const fileContents: any = e.target.result;
            const parsedJson = JSON.parse(fileContents);
            setKeystore(parsedJson);
          }
        } catch (e) {
          setFileError("Unsupported file format");
        }
      };
      reader.readAsText(file);

    } else {
      setKeystore(null);
    }
  };

  const { connect, connectors, isLoading, pendingConnector } = useConnect();

  const importKeystoreFileHandler = async () => {
    setIsUnlockingKeystore(true);
    console.log("unlocking...");
    try {
      const result = await unlockKeystore(keystore, password);
      const PK: any = result?.getPrivateKeyString && result?.getPrivateKeyString();
      if (PK) {
        const account = privateKeyToAccount(PK);
        const walletClient = createWalletClient({
          account,
          chain: mainnet,
          transport: http(),
        }).extend(publicActions);

        const connector = new KeystoreConnector({
          options: {
            walletClient: walletClient,
          },
        });
        connect({ chainId: 820, connector });
        setIsOpenKeystore(false);
        setIsOpen(false);
      }
      setIsUnlockingKeystore(false);
    } catch (error) {
      console.log("importKeystoreFileHandler ~ error:", error);
      setIsUnlockingKeystore(false);
    }
  };

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
          {wallets.map(({id, name, image}) => {
            return <PickButton key={id} isActive={false} onClick={async () => {
              if(id === "metamask") {
                connectMetamask();
                setIsOpen(false);
              }
              if(id === "wc") {
                await open();
              }
              if(id === "ledger") {
                connectLedger();
              }
              if(id === "keystore") {
                setIsOpenKeystore(true);
              }
            }} image={image} label={name} />
          })}
        </div>
        <Dialog isOpen={isOpenKeystore} setIsOpen={setIsOpenKeystore}>
          <input
            type="file"
            onChange={handleFileChange}
          />
          <div>
            Key store password
          </div>
          <div >
            <input
              value={password}
              type="password"
              required
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="Key store password"
            />

          </div>

          <Button onClick={() => ""}>
            {!isUnlockingKeystore ? "Unlock" : "Loading..."}
          </Button>
        </Dialog>
      </div>
    </div>
  </Dialog>
}
