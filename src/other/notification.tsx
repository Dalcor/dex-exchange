import { ExternalToast, toast } from "sonner";

import Notification, { NotificationTransactionStatus } from "@/components/atoms/Notification";
import { IRecentTransactionTitle } from "@/stores/useRecentTransactionsStore";

export function addNotification(
  transactionTitle: IRecentTransactionTitle,
  transactionStatus: NotificationTransactionStatus,
  options?: ExternalToast,
) {
  return toast.custom(
    (t) => (
      <Notification
        onDismiss={() => toast.dismiss(t)}
        transactionTitle={transactionTitle}
        transactionStatus={transactionStatus}
      />
    ),
    { position: "top-right", ...options },
  );
}
