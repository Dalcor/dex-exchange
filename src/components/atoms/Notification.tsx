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
  switch (title.template) {
    case RecentTransactionTitleTemplate.APPROVE:
      return (
        <div className="flex items-center gap-1">
          <span className="text-16 font-medium block mr-1">
            {status === RecentTransactionStatus.SUCCESS
              ? `${title.symbol} approved`
              : `Failed to approve ${title.symbol}`}
          </span>
          <Badge color="green" text="ERC-20" />
        </div>
      );
    case RecentTransactionTitleTemplate.DEPOSIT:
      return (
        <div className="flex items-center gap-1">
          <span className="text-16 font-medium block mr-1">
            {status === RecentTransactionStatus.SUCCESS
              ? `${title.symbol} deposited`
              : `FFailed to deposit ${title.symbol}`}
          </span>
          <Badge color="green" text="ERC-223" />
        </div>
      );
    case RecentTransactionTitleTemplate.WITHDRAW:
      return (
        <div className="flex items-center gap-1">
          <span className="text-16 font-medium block mr-1">
            {status === RecentTransactionStatus.SUCCESS
              ? `${title.symbol} withdrew`
              : `Failed to withdraw ${title.symbol}`}
          </span>
          <Badge color="green" text="ERC-223" />
        </div>
      );
    case RecentTransactionTitleTemplate.SWAP:
      return (
        <div className="flex items-center gap-1">
          <span className="text-16 font-medium block mr-1">
            {status === RecentTransactionStatus.SUCCESS ? "Swap successful" : "Failed to swap"}
          </span>
        </div>
      );
    case RecentTransactionTitleTemplate.COLLECT:
      return (
        <div className="flex items-center gap-1">
          {status === RecentTransactionStatus.SUCCESS ? "Fees collected" : "Failed to collect fees"}
        </div>
      );
    case RecentTransactionTitleTemplate.REMOVE:
      return (
        <div className="flex items-center gap-1">
          {status === RecentTransactionStatus.SUCCESS
            ? "Liquidity removed"
            : "Failed to remove liquidity"}
        </div>
      );
    case RecentTransactionTitleTemplate.ADD:
      return (
        <div className="flex items-center gap-1">
          {status === RecentTransactionStatus.SUCCESS
            ? "Liquidity added"
            : "Failed to add liquidity"}
        </div>
      );
  }
}

export default function Notification({ onDismiss, transactionTitle, transactionStatus }: Props) {
  return (
    <div className="grid grid-cols-[1fr_48px] rounded-3 border border-secondary-border shadow-popover bg-primary-bg">
      <div className="flex gap-2 items-center p-5">
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
