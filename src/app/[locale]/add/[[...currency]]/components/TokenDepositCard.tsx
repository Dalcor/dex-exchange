import Image from "next/image";
import { useState } from "react";

import Checkbox from "@/components/atoms/Checkbox";
import Tooltip from "@/components/atoms/Tooltip";
import TextLabel from "@/components/labels/TextLabel";
import { WrappedToken } from "@/config/types/WrappedToken";

function InputWithCheckboxControl({
  enabled,
  setEnabled,
  standard,
  token,
  value,
  onChange,
}: {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  standard: "ERC-20" | "ERC-223";
  token: WrappedToken;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={enabled}
            handleChange={() => setEnabled(!enabled)}
            id={`${token.address}_${standard}`}
            label={"Standard"}
          />
          <TextLabel color="green" text={standard} />
        </div>
        <Tooltip text="Tooltip text" />
      </div>
      <div className="bg-primary-bg px-5 pt-5 pb-4">
        <div className="mb-1 flex justify-between items-center">
          <input
            className="text-20 bg-transparent flex-grow outline-0"
            placeholder="0"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="bg-secondary-bg rounded-5 py-1 pl-1 pr-3 flex items-center gap-2">
            <Image src={token.logoURI} alt="" width={24} height={24} />
            <span>{token.symbol}</span>
          </div>
        </div>
        <div className="flex justify-between items-center text-14">
          <span className="text-secondary-text">—</span>
          <span>Balance: 1000</span>
        </div>
      </div>
    </div>
  );
}
export default function TokenDepositCard({
  token,
  value,
  onChange,
}: {
  token: WrappedToken;
  value: string;
  onChange: (value: string) => void;
}) {
  const [enabledERC20, setEnabledERC20] = useState(false);
  const [enabledERC223, setEnabledERC223] = useState(false);

  return (
    <div className="rounded-3 bg-secondary-bg p-5">
      <div className="flex items-center gap-2 mb-3">
        <Image width={24} height={24} src={token.logoURI} alt="" />
        <h3 className="text-16 font-bold">{token.symbol} deposit amounts</h3>
      </div>
      <div className="text-secondary-text text-14 mb-3">Total balance: 1400</div>
      <div className="flex flex-col gap-5">
        <InputWithCheckboxControl
          standard="ERC-20"
          enabled={enabledERC20}
          setEnabled={setEnabledERC20}
          token={token}
          value={value}
          onChange={onChange}
        />
        <InputWithCheckboxControl
          standard="ERC-223"
          enabled={enabledERC223}
          setEnabled={setEnabledERC223}
          token={token}
          value={"value"}
          onChange={() => null}
        />
      </div>
    </div>
  );
}
