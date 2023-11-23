import Dialog from "@/components/atoms/Dialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import IconButton from "@/components/atoms/IconButton";
import Svg from "@/components/atoms/Svg";
import { useAccount, useDisconnect } from "wagmi";
import Image from "next/image";
import { wallets } from "@/config/wallets";
import ButtonWithIcon from "@/components/atoms/ButtonWithIcon";
import Tabs from "@/components/tabs/Tabs";
import Tab from "@/components/tabs/Tab";

interface Props {
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void
}

export default function WalletDialog({ isOpen, setIsOpen }: Props) {
  const { disconnect } = useDisconnect();
  const { address } = useAccount();

  return <Dialog isOpen={isOpen} setIsOpen={setIsOpen}>
    <DialogHeader onClose={() => setIsOpen(false)} title="Account"/>
    <div className="pt-10 pl-10 pr-10 min-w-[600px]">
      <div className="relative bg-gradient-to-tr from-[#183321] from-45% to-100% to-[#224C31]">
        <div className="absolute right-0 top-0 bottom-0 bg-account-card-pattern bg-no-repeat bg-right w-full h-full" />
        <div className="relative mb-5 p-5 rounded-2 grid gap-3 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 p-2 rounded-1 bg-block-fill">
                <Image src={wallets.metamask.image} alt="" width={24} height={24} />
                {`${address?.slice(0, 5)}...${address?.slice(-3)}`}
              </div>
              <IconButton>
                <Svg iconName="copy"/>
              </IconButton>
              <IconButton>
                <Svg iconName="etherscan"/>
              </IconButton>
            </div>
            <div>
              <IconButton onClick={() => disconnect()}>
                <Svg iconName="logout"/>
              </IconButton>
            </div>
          </div>
          <div>
            <div className="text-16 text-font-secondary">Balance</div>
            <div className="text-20 text-font-primary font-bold">$234.234</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <ButtonWithIcon text="Buy" icon="wallet" />
            <ButtonWithIcon text="Receive" icon="arrow-bottom" />
            <ButtonWithIcon text="Send" icon="to-top" />
          </div>
        </div>
      </div>
      <Tabs>
        <Tab title="Assets">
          <div className="flex flex-col items-center justify-center min-h-[324px] gap-2">
            <Image src="/empty/empty-assets.svg" width={80} height={80} alt="" />
            <span className="text-font-secondary">All assets will be displayed here.</span>
          </div>
        </Tab>
        <Tab title="History">
          <div className="flex flex-col items-center justify-center min-h-[324px] gap-2">
            <Image src="/empty/empty-history.svg" width={80} height={80} alt="" />
            <span className="text-font-secondary">All transaction will be displayed here.</span>
          </div>
        </Tab>
      </Tabs>
    </div>
  </Dialog>
}
