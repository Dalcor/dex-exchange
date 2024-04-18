import Dialog from "@/components/atoms/Dialog";
import Preloader from "@/components/atoms/Preloader";
import { useConfirmInWalletDialogStore } from "@/stores/useConfirmInWalletDialogStore";

export default function ConfirmInWalletDialog() {
  const { closeConfirmInWalletDialog, isOpened, title, description } =
    useConfirmInWalletDialogStore();

  return (
    <Dialog isOpen={isOpened} setIsOpen={closeConfirmInWalletDialog}>
      <div className="w-[400px] p-5 flex flex-col gap-2 items-center justify-center">
        <Preloader size={30} />
        <h3 className="text-18">{title}</h3>
        <p>{description}</p>
      </div>
    </Dialog>
  );
}
