import Container from "@/components/atoms/Container";
import Preloader from "@/components/atoms/Preloader";
import IconButton, { IconButtonVariant } from "@/components/buttons/IconButton";
import { useConfirmInWalletAlertStore } from "@/stores/useConfirmInWalletAlertStore";

export default function ConfirmInWalletAlert() {
  const { isOpened, description, closeConfirmInWalletAlert } = useConfirmInWalletAlertStore();

  return (
    <>
      {isOpened && (
        <div className="z-[1000] fixed w-full bg-green-bg border-green border-t shadow-notification bottom-0">
          <Container>
            <div className="h-[80px] flex justify-between items-center px-5">
              <div className="flex gap-3 items-center">
                <Preloader type="linear" />
                <span>{description}</span>
              </div>
              <IconButton
                variant={IconButtonVariant.CLOSE}
                handleClose={closeConfirmInWalletAlert}
              />
            </div>
          </Container>
        </div>
      )}
    </>
  );
}
