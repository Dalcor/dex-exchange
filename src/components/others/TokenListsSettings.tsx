import SelectButton from "@/components/atoms/SelectButton";
import Switch from "@/components/atoms/Switch";
import Tooltip from "@/components/atoms/Tooltip";
import Popover from "@/components/atoms/Popover";
import { useState } from "react";
import Input from "@/components/atoms/Input";

export default function TokenListsSettings() {
  const [isOpened, setIsOpened] = useState(false);

  return <Popover isOpened={isOpened} setIsOpened={setIsOpened} placement="bottom-start"
           trigger={<SelectButton isOpen={isOpened} onClick={() => setIsOpened(!isOpened)}>Default token list</SelectButton>}
  >
    <div className="bg-primary-bg border border-primary-border rounded-1">
      <div className="border-b-primary-border border-b px-5">
        <div className="flex justify-between py-4 gap-2 items-center border-b border-b-secondary-border">
          <span className="text-green">Default token list</span>
          <Switch checked={true} setChecked={null} />
        </div>
        <div className="flex justify-between py-4 gap-4 items-center border-b border-b-secondary-border">
          Auto-listing contract 0x01214023dhj23dj23... (Tier 1)
          <Switch checked={true} setChecked={null} />
        </div>
        <div className="flex justify-between py-4 gap-4 items-center border-b border-b-secondary-border">
          Auto-listing contract 0xff124fabqwdadasas... (Tier 2)
          <Switch checked={true} setChecked={null} />
        </div>
        <div className="flex justify-between py-4 gap-4 items-center border-b border-b-secondary-border">
          Auto-listing contract 0x0021fdb23d... (Shitcoin tier)
          <Switch checked={true} setChecked={null} />
        </div>
        <div className="flex justify-between py-4 gap-4 items-center">
          DEX223 TokenLists API
          <Switch checked={true} setChecked={null} />
        </div>
      </div>
      <div className="py-4 px-5 border-b-primary-border border-b">
        <div className="flex gap-2 mb-1 items-center">
          <h3>Custom auto-listing contract</h3>
          <Tooltip text="Helper text" />
          <span className="text-red px-2 border border-red rounded-5 bg-red-bg">Risky</span>
        </div>
        <Input type="text"
               placeholder="Custom auto-listing contract" />
        <div className="text-secondary-text text-12">Enter the contract address to retrieve tokens</div>

      </div>
      <div className="py-4 px-5">
        <div className="flex gap-2 mb-1 items-center">
          <h3>Custom TokenList, URL</h3>
          <Tooltip text="Helper info text"/>
          <span className="text-red px-2 border border-red rounded-5 bg-red-bg">Risky</span>
        </div>
        <Input type="text"
               placeholder="Custom auto-listing contract" />
        <div className="text-secondary-text text-12">Enter the token list URL</div>

      </div>
    </div>
  </Popover>
}
