import SelectButton from "@/components/atoms/SelectButton";
import Image from "next/image";
import { networks } from "@/config/networks";
import SelectOption from "@/components/atoms/SelectOption";
import Svg from "@/components/atoms/Svg";
import Popover from "@/components/atoms/Popover";
import { useMemo, useState } from "react";
import { useChainId, useSwitchNetwork } from "wagmi";
import ClientOnly from "@/components/others/ClientOnly";

export default function NetworkPicker() {
  const [isOpened, setIsOpened] = useState(false);
  const chain = useChainId();
  const currentNetwork = useMemo(() => {
    return networks.find(n => n.chainId === chain);
  }, [chain]);
  const { switchNetwork } = useSwitchNetwork();

  console.log(chain);
  if (!chain) {
    return null;
  }

  return <ClientOnly>
    <Popover isOpened={isOpened} setIsOpened={setIsOpened} placement="bottom-start" trigger={
      <SelectButton isOpen={isOpened} onClick={() => setIsOpened(!isOpened)}>
            <span className="flex items-center gap-2 min-w-[110px]">
              <Image src={`${currentNetwork?.logo}`} alt="Ethereum" width={24} height={24}/>
              {currentNetwork?.name}
            </span>
      </SelectButton>}>
      <div className="py-1 text-16 bg-block-fill border border-primary-border rounded-1 min-w-[280px]">
        <div className="border-b-primary-border pb-1 border-b">
          {networks.map(({ chainId, name, logo }) => {
            return <SelectOption key={chainId} onClick={async () => {
              if (switchNetwork) {
                switchNetwork(chainId);
              }
              setIsOpened(false);
            }} isActive={chainId === chain}>
              <Image src={logo} alt={name} width={24} height={24}/>
              {name}
            </SelectOption>
          })}
        </div>
        <div className="pt-1">
          <div role="button"
               className="flex gap-2 items-center py-3 px-5 bg-block-fill hover:bg-table-fill duration-200">
            <Svg iconName="add"/>
            Add custom node
            <span className="text-red block ml-auto">Risky</span>
          </div>
        </div>


      </div>
    </Popover>
  </ClientOnly>
}
