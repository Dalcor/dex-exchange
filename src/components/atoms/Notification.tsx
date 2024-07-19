import { useTranslations } from "next-intl";
import React from "react";

import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Badge from "@/components/badges/Badge";
import IconButton, { IconButtonVariant } from "@/components/buttons/IconButton";
import {
  RecentTransactionLogo,
  RecentTransactionSubTitle,
} from "@/components/common/RecentTransaction";
import {
  IRecentTransactionTitle,
  RecentTransactionStatus,
  RecentTransactionTitleTemplate,
} from "@/stores/useRecentTransactionsStore";

export type NotificationTransactionStatus =
  | RecentTransactionStatus.ERROR
  | RecentTransactionStatus.SUCCESS;

interface Props {
  onDismiss: () => void;
  transactionTitle: IRecentTransactionTitle;
  transactionStatus: NotificationTransactionStatus;
}

function NotificationTitle({
  title,
  status,
}: {
  title: IRecentTransactionTitle;
  status: NotificationTransactionStatus;
}) {
  const t = useTranslations("RecentTransactions");

  switch (title.template) {
    case RecentTransactionTitleTemplate.APPROVE:
      return (
        <div className="flex items-center gap-1">
          <span className="text-16 font-medium block mr-1">
            {status === RecentTransactionStatus.SUCCESS
              ? t("approve_success_notification", { symbol: title.symbol })
              : t("approve_revert_notification", { symbol: title.symbol })}
          </span>
          {status === RecentTransactionStatus.SUCCESS && <Badge color="green" text="ERC-20" />}
        </div>
      );
    case RecentTransactionTitleTemplate.DEPOSIT:
      return (
        <div className="flex items-center gap-1">
          <span className="text-16 font-medium block mr-1">
            {status === RecentTransactionStatus.SUCCESS
              ? t("deposit_success_notification", { symbol: title.symbol })
              : t("deposit_revert_notification", { symbol: title.symbol })}
          </span>
          <Badge color="green" text="ERC-223" />
        </div>
      );
    case RecentTransactionTitleTemplate.WITHDRAW:
      return (
        <div className="flex items-center gap-1">
          <span className="text-16 font-medium block mr-1">
            {status === RecentTransactionStatus.SUCCESS
              ? t("withdraw_success_notification", { symbol: title.symbol })
              : t("withdraw_revert_notification", { symbol: title.symbol })}
          </span>
          <Badge color="green" text="ERC-223" />
        </div>
      );
    case RecentTransactionTitleTemplate.SWAP:
      return (
        <div className="flex items-center gap-1">
          <span className="text-16 font-medium block mr-1">
            {status === RecentTransactionStatus.SUCCESS
              ? t("swap_success_notification")
              : t("swap_revert_notification")}
          </span>
        </div>
      );
    case RecentTransactionTitleTemplate.COLLECT:
      return (
        <div className="flex items-center gap-1">
          {status === RecentTransactionStatus.SUCCESS
            ? t("collect_success_notification")
            : t("collect_revert_notification")}
        </div>
      );
    case RecentTransactionTitleTemplate.REMOVE:
      return (
        <div className="flex items-center gap-1">
          {status === RecentTransactionStatus.SUCCESS
            ? t("remove_liquidity_success_notification")
            : t("remove_liquidity_revert_notification")}
        </div>
      );
    case RecentTransactionTitleTemplate.ADD:
      return (
        <div className="flex items-center gap-1">
          {status === RecentTransactionStatus.SUCCESS
            ? t("add_liquidity_success_notification")
            : t("remove_liquidity_revert_notification")}
        </div>
      );
  }
}

export default function Notification({ onDismiss, transactionTitle, transactionStatus }: Props) {
  return (
    <div className="grid grid-cols-[1fr_48px] rounded-3 border border-secondary-border shadow-popover bg-primary-bg w-full">
      <div className="flex gap-2 items-center p-5 whitespace-nowrap">
        {transactionStatus === RecentTransactionStatus.SUCCESS ? (
          <RecentTransactionLogo title={transactionTitle} />
        ) : (
          <EmptyStateIcon size={48} iconName="warning" />
        )}
        <div className="grid">
          <NotificationTitle title={transactionTitle} status={transactionStatus} />
          <RecentTransactionSubTitle title={transactionTitle} />
        </div>
      </div>
      <IconButton variant={IconButtonVariant.CLOSE} handleClose={onDismiss} />
    </div>
  );
}
