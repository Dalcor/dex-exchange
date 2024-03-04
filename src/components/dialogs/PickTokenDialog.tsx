import Dialog from "@/components/atoms/Dialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import Input from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import Image from "next/image";
import { WrappedToken } from "@/config/types/WrappedToken";
import { useTokens } from "@/hooks/useTokenLists";

interface Props {
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void,
  handlePick: (token: WrappedToken) => void
}

function TokenRow({token, handlePick}: {token: WrappedToken, handlePick: (token: WrappedToken) => void}) {

  return <div role="button" onClick={() => handlePick(token)} className="px-10 flex justify-between py-2">
    <div className="flex items-center gap-3">
      <Image width={40} height={40} src={token.logoURI} alt=""/>
      <div className="grid">
        <span>{token.symbol}</span>
        <span className="text-secondary-text text-12">1.23 {token.symbol}</span>
      </div>

    </div>
    <div className="flex items-center gap-3">
      <span>$1,827.42</span>
      <span className="text-secondary-text"><Svg iconName="question"/></span>
      <Svg iconName="pin"/>
    </div>
  </div>
}



export default function PickTokenDialog({ isOpen, setIsOpen, handlePick }: Props) {
  const tokens = useTokens();

  return <Dialog isOpen={isOpen} setIsOpen={setIsOpen}>
    <DialogHeader onClose={() => setIsOpen(false)} title="Select a token"/>
    <div className="w-[570px]">
      <div className="pt-10 pl-10 pr-10 pb-3">
        <Input placeholder="Search name or paste address"/>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <button
            className="items-center justify-center duration-200 h-10 rounded-1 border border-primary-border hover:border-green flex gap-2">
            <Image width={24} height={24} src="/tokens/ETH.svg" alt=""/>
            ETH
          </button>
          <button
            className="items-center justify-center duration-200 h-10 rounded-1 border border-primary-border hover:border-green flex gap-2">
            <Image width={24} height={24} src="/tokens/USDT.svg" alt=""/>
            USDT
          </button>
          <button
            className="items-center justify-center duration-200 h-10 rounded-1 border border-primary-border hover:border-green flex gap-2">
            <Image width={24} height={24} src="/tokens/DEX.svg" alt=""/>
            DEX223
          </button>
        </div>
      </div>
      <div className="h-[420px] overflow-scroll">
        {tokens.map(token => <TokenRow handlePick={handlePick} key={token.address} token={token} />)}
      </div>
    </div>
  </Dialog>
}
