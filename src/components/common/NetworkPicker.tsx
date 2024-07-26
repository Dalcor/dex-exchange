import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

import Popover from "@/components/atoms/Popover";
import SelectButton from "@/components/atoms/SelectButton";
import SelectOption from "@/components/atoms/SelectOption";
import Svg from "@/components/atoms/Svg";
import ClientOnly from "@/components/common/ClientOnly";
import { useConnectWalletStore } from "@/components/dialogs/stores/useConnectWalletStore";
import { useUnknownNetworkWarningStore } from "@/components/dialogs/stores/useUnknownNetworkWarningStore";
import { networks } from "@/config/networks";
import { formatFloat } from "@/functions/formatFloat";
import { addNotification } from "@/other/notification";
import { useConfirmInWalletDialogStore } from "@/stores/useConfirmInWalletDialogStore";

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
  const { switchChainAsync } = useSwitchChain();
  const { openConfirmInWalletDialog, closeConfirmInWalletDialog } = useConfirmInWalletDialogStore();
  const { openNoTokenListsEnabledWarning, closeNoTokenListsEnabledWarning } =
    useUnknownNetworkWarningStore();

  useEffect(() => {
    console.log(currentNetwork);
    if (!currentNetwork) {
      openNoTokenListsEnabledWarning();
    } else {
      closeNoTokenListsEnabledWarning();
    }
  }, [closeNoTokenListsEnabledWarning, currentNetwork, openNoTokenListsEnabledWarning]);

  return (
    <ClientOnly>
      <Popover
        isOpened={isOpened}
        setIsOpened={setIsOpened}
        placement="bottom-start"
        trigger={
          <SelectButton
            className="pl-2 pr-1 py-1 xl:py-2 gap-0 md:gap-2 xl:px-3"
            isOpen={isOpened}
            onClick={() => setIsOpened(!isOpened)}
          >
            {currentNetwork ? (
              <span className="flex items-center gap-2 xl:min-w-[110px]">
                <Image src={`${currentNetwork?.logo}`} alt="Ethereum" width={24} height={24} />
                <span className="hidden xl:inline">{currentNetwork?.name}</span>
              </span>
            ) : (
              "Unknown network"
            )}
          </SelectButton>
        }
      >
        <div className="py-1 text-16 bg-primary-bg rounded-1 min-w-[280px]">
          <div>
            {networks.map(({ chainId: _chainId, name, logo }) => {
              return (
                <SelectOption
                  key={_chainId}
                  onClick={async () => {
                    if (!chainId) {
                      setChainToConnect(_chainId);
                    }
                    if (switchChainAsync) {
                      try {
                        openConfirmInWalletDialog(`Change network`);
                        await switchChainAsync({ chainId: _chainId });
                      } catch (e) {
                        console.log(e);
                      } finally {
                        closeConfirmInWalletDialog();
                      }
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
          {/*<div className="pt-1">*/}
          {/*  <div*/}
          {/*    role="button"*/}
          {/*    className="flex gap-2 items-center py-3 px-5 bg-primary-bg hover:bg-tertiary-bg duration-200"*/}
          {/*  >*/}
          {/*    <Svg iconName="add" />*/}
          {/*    Add custom node*/}
          {/*    <span className="text-red block ml-auto">Risky</span>*/}
          {/*  </div>*/}
          {/*</div>*/}
        </div>
      </Popover>
    </ClientOnly>
  );
}
