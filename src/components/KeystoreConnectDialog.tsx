import Dialog from "@/components/atoms/Dialog";
import Button from "@/components/atoms/Button";
import { ChangeEvent, useState } from "react";
import { useConnect } from "wagmi";
import { unlockKeystore } from "@/functions/keystore";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http, publicActions } from "viem";
import { mainnet } from "viem/chains";
import { KeystoreConnector } from "@/config/connectors/keystore/connector";

interface Props {
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void
}
export default function KeystoreConnectDialog({isOpen, setIsOpen}: Props) {
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
        setIsOpen(false);
      }
      setIsUnlockingKeystore(false);
    } catch (error) {
      console.log("importKeystoreFileHandler ~ error:", error);
      setIsUnlockingKeystore(false);
    }
  };

  return <Dialog isOpen={isOpen} setIsOpen={setIsOpen}>
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

    <Button onClick={importKeystoreFileHandler}>
      {!isUnlockingKeystore ? "Unlock" : "Loading..."}
    </Button>
  </Dialog>
}
