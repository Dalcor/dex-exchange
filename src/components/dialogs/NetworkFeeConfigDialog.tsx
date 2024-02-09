import Dialog from "@/components/atoms/Dialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import Tabs from "@/components/tabs/Tabs";
import Tab from "@/components/tabs/Tab";
import TextField from "@/components/atoms/TextField";

interface Props {
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void
}
export default function NetworkFeeConfigDialog({isOpen, setIsOpen}: Props) {

  return <Dialog isOpen={isOpen} setIsOpen={setIsOpen}>
    <div className="w-[640px]">
      <DialogHeader onClose={() => setIsOpen(false)} title="Network fee" paragraph="Network fee is paid when you submit a transaction. We recommend changing Priority Fee only in order to make transaction cheaper or speed it up at a cost of paying higher fee. There are two types of transactions in Ethereum: EIP-1559 and Legacy. Network Fee = gasLimit * (Base Fee + Priority Fee) for EIP-1559 transactions. Network Fee = gasLimit * gasPrice for Legacy transactions. We recommend using EIP-1559 transactions on any chain except BSC. BSC does not support EIP-1559 transactions so use Legacy there." />
      <div className="px-10 pt-10 pb-9 border-b border-secondary-border">
        <Tabs>
          <Tab title="EIP-1559">
            <div className="grid gap-3 grid-cols-2 mt-4">
              <TextField placeholder="Base fee" label="Base fee" tooltipText="Base fee tooltip" />
              <TextField placeholder="Priority fee" label="Priority fee" tooltipText="Priority fee tooltip" />
            </div>
          </Tab>
          <Tab title="Legacy">
            <div className="mt-4">
              <TextField placeholder="Gas price" label="Gas price" tooltipText="Gas Price tooltip" />
            </div>
          </Tab>
        </Tabs>
      </div>
      <div className="px-10 pt-9 pb-10">
        <TextField placeholder="Gas limit" label="Gas limit" tooltipText="gasLimit is a measure of actions that a contract can perform in your transaction. Setting gasLimit to a low value may result in your transaction not being able to perform the necessary actions (i.e. purchase tokens) and fail. We don't recommend changing this unless you absolutely know what you're doing." />
      </div>
    </div>
  </Dialog>
}
