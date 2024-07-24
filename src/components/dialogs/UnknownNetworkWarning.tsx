import { useTranslations } from "next-intl";
import { useSwitchChain } from "wagmi";

import Container from "@/components/atoms/Container";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import { useUnknownNetworkWarningStore } from "@/components/dialogs/stores/useUnknownNetworkWarningStore";
import { DexChainId } from "@/sdk_hybrid/chains";

export default function UnknownNetworkWarning() {
  const t = useTranslations("ManageTokens");
  const { isOpened, title, closeNoTokenListsEnabledWarning, openNoTokenListsEnabledWarning } =
    useUnknownNetworkWarningStore();
  const { switchChain } = useSwitchChain();

  return (
    <>
      {isOpened && (
        <div className="z-[1000] fixed w-full bg-orange-bg border-orange border-t shadow-warning-alert bottom-0">
          <Container>
            <div className="min-h-[80px] py-4 flex justify-between items-center px-5">
              <div className="flex gap-3 items-center">
                <Svg className="text-orange flex-shrink-0" iconName="change-network" />
                {title}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => switchChain({ chainId: DexChainId.SEPOLIA })}
                  size={ButtonSize.SMALL}
                  variant={ButtonVariant.OUTLINED}
                >
                  Change network
                </Button>
              </div>
            </div>
          </Container>
        </div>
      )}
    </>
  );
}
