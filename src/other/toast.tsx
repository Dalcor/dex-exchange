import { ExternalToast, toast } from "sonner";

import Toast, { ToastType } from "@/components/atoms/Toast";

export default function addToast(
  text: string,
  type: ToastType = "success",
  options?: ExternalToast,
) {
  return toast.custom(
    (t) => <Toast text={text} onDismiss={() => toast.dismiss(t)} type={type} />,
    options,
  );
}
