import { useEffect } from "react";

import Container from "@/components/atoms/Container";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import IconButton, { IconButtonVariant } from "@/components/buttons/IconButton";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useTokenLists } from "@/hooks/useTokenLists";
import { DEX_SUPPORTED_CHAINS } from "@/sdk_hybrid/chains";
import { useManageTokensDialogStore } from "@/stores/useManageTokensDialogStore";
import { useNoTokenListsEnabledWarningStore } from "@/stores/useNoTokenListsEnabledWarningStore";

export default function NoTokenListsEnabledWarning() {
  const { isOpened, title, closeNoTokenListsEnabledWarning, openNoTokenListsEnabledWarning } =
    useNoTokenListsEnabledWarningStore();

  const { isOpen: isManageOpened, setIsOpen: setManageOpened } = useManageTokensDialogStore();
  const lists = useTokenLists();
  const chainId = useCurrentChainId();

  useEffect(() => {
    if (!lists) {
      return;
    }

    const enabledList = lists.find((l) => l.enabled);

    if (!enabledList && DEX_SUPPORTED_CHAINS.includes(chainId)) {
      openNoTokenListsEnabledWarning();
    } else {
      closeNoTokenListsEnabledWarning();
    }
  }, [closeNoTokenListsEnabledWarning, lists, openNoTokenListsEnabledWarning, chainId]);
  return (
    <>
      {isOpened && (
        <div className="z-[1000] fixed w-full bg-orange-bg border-orange border-t shadow-warning-alert bottom-0">
          <Container>
            <div className="min-h-[80px] py-4 flex justify-between items-center px-5">
              <div className="flex gap-3 items-center">
                <Svg className="text-orange flex-shrink-0" iconName="warning" />
                {title}
              </div>
              <div className="flex items-center gap-3">
                {!isManageOpened && (
                  <Button
                    onClick={() => setManageOpened(true)}
                    size={ButtonSize.SMALL}
                    variant={ButtonVariant.OUTLINED}
                  >
                    Manage lists
                  </Button>
                )}
                <IconButton
                  variant={IconButtonVariant.CLOSE}
                  handleClose={closeNoTokenListsEnabledWarning}
                />
              </div>
            </div>
          </Container>
        </div>
      )}
    </>
  );
}
