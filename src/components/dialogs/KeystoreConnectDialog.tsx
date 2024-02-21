import Dialog from "@/components/atoms/Dialog";
import Button from "@/components/atoms/Button";
import { ChangeEvent, useRef, useState } from "react";
import { useConnect } from "wagmi";
import { unlockKeystore } from "@/functions/keystore";
import { keystore } from "@/config/connectors/keystore/connector";
import DialogHeader from "@/components/atoms/DialogHeader";
import AwaitingLoader from "@/components/atoms/AwaitingLoader";
import TextField from "@/components/atoms/TextField";
import { useConnectWalletStore } from "@/components/dialogs/stores/useConnectWalletStore";

interface Props {
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void
}

export default function KeystoreConnectDialog({ isOpen, setIsOpen }: Props) {
  const fileInput = useRef<HTMLInputElement | null>(null);
  const { chainToConnect } = useConnectWalletStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [keystoreFile, setKeystore] = useState<{ [key: string]: string } | null>(null);
  const [isUnlockingKeystore, setIsUnlockingKeystore] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [fileError, setFileError] = useState<string | undefined>();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setFileError(undefined);
    const file = event?.target?.files?.[0];

    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (e.target) {
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

  const { connect } = useConnect();

  const importKeystoreFileHandler = async () => {
    setIsUnlockingKeystore(true);
    try {
      const result = await unlockKeystore(keystoreFile, password);
      const PK: any = result?.getPrivateKeyString && result?.getPrivateKeyString();

      if (PK) {
        const connector = keystore({pk: PK});

        // const a = connector.connect({chainId: 820});
        // console.log(a);
        connect({ chainId: chainToConnect, connector });

        setIsOpen(false);
      }
    } catch (error) {
      console.log("importKeystoreFileHandler ~ error:", error);
    } finally {
      setIsUnlockingKeystore(false);
    }
  };

  return <Dialog isOpen={isOpen} setIsOpen={setIsOpen}>
    <div className="min-w-[440px]">
      <DialogHeader onClose={() => setIsOpen(false)} title="Import wallet with JSON file"/>

      <div className="p-10">
        <input
          type="file"
          onChange={(e) => handleFileChange(e)}
          style={{ display: "none" }}
          ref={fileInput}
        />
        <div className="flex items-center justify-between">
          <div className="w-[120px]">
            <Button onClick={() => {
              if (fileInput.current && fileInput.current) {
                fileInput.current.click()
              }
            }} variant="outline">Browse...</Button>
          </div>
          <p
            className="overflow-hidden overflow-ellipsis whitespace-nowrap w-[200px]">{selectedFile?.name ? `${selectedFile?.name}` :
            <span className="text-secondary-text">Select keystore file</span>}</p>
        </div>
        <div className="text-red text-12 pb-4 pt-1 h-10">
          {fileError && fileError}
        </div>
          <div>
            <TextField
              label="Key store password"
              value={password}
              type="password"
              required
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="Key store password"
              error={fileError}
              helperText="Helper text"
            />
            <div className="mt-6">
              <Button fullWidth onClick={() => importKeystoreFileHandler()}>
                {!isUnlockingKeystore ? "Unlock" : <AwaitingLoader size={30}/>}
              </Button>
            </div>
          </div>
      </div>

    </div>
  </Dialog>
}
