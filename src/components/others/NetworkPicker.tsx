import Image from "next/image";
import { useMemo, useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

import Popover from "@/components/atoms/Popover";
import SelectButton from "@/components/atoms/SelectButton";
import SelectOption from "@/components/atoms/SelectOption";
import Svg from "@/components/atoms/Svg";
import { useConnectWalletStore } from "@/components/dialogs/stores/useConnectWalletStore";
import ClientOnly from "@/components/others/ClientOnly";
import { networks } from "@/config/networks";

export default function NetworkPicker() {
  const [isOpened, setIsOpened] = useState(false);
  const { chainToConnect, setChainToConnect } = useConnectWalletStore();
  const { chainId } = useAccount();
  const currentNetwork = useMemo(() => {
    if (chainId) {
      return networks.find((n) => n.chainId === chainId);
    }
    return networks.find((n) => n.chainId === chainToConnect);
  }, [chainId, chainToConnect]);
  const { switchChain } = useSwitchChain();

  console.log(chainId);
  console.log(currentNetwork);

  return (
    <ClientOnly>
      <Popover
        isOpened={isOpened}
        setIsOpened={setIsOpened}
        placement="bottom-start"
        trigger={
          <SelectButton isOpen={isOpened} onClick={() => setIsOpened(!isOpened)}>
            <span className="flex items-center gap-2 min-w-[110px]">
              <Image src={`${currentNetwork?.logo}`} alt="Ethereum" width={24} height={24} />
              {currentNetwork?.name}
            </span>
          </SelectButton>
        }
      >
        <div className="py-1 text-16 bg-primary-bg border border-primary-border rounded-1 min-w-[280px]">
          <div className="border-b-primary-border pb-1 border-b">
            {networks.map(({ chainId: _chainId, name, logo }) => {
              return (
                <SelectOption
                  key={chainId}
                  onClick={async () => {
                    if (!chainId) {
                      console.log(chainId);
                      console.log("Change chain to connect");
                      setChainToConnect(_chainId);
                    }
                    if (switchChain) {
                      switchChain({ chainId: _chainId });
                    }

                    setIsOpened(false);
                  }}
                  isActive={_chainId === currentNetwork?.chainId}
                >
                  <Image src={logo} alt={name} width={24} height={24} />
                  {name}
                </SelectOption>
              );
            })}
          </div>
          <div className="pt-1">
            <div
              role="button"
              className="flex gap-2 items-center py-3 px-5 bg-primary-bg hover:bg-tertiary-bg duration-200"
            >
              <Svg iconName="add" />
              Add custom node
              <span className="text-red block ml-auto">Risky</span>
            </div>
          </div>
        </div>
      </Popover>
    </ClientOnly>
  );
}
