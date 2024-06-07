import { useCallback, useEffect, useMemo } from "react";
import { Address } from "viem";
import { useAccount, usePublicClient } from "wagmi";

import { addNotification } from "@/other/notification";
import {
  IRecentTransactionTitle,
  RecentTransactionStatus,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";

const trackingTransactions: Address[] = [];
export function useRecentTransactionTracking() {
  const { transactions, updateTransactionStatus } = useRecentTransactionsStore();
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const transactionsForAddress = useMemo(() => {
    return (address && transactions[address]) || [];
  }, [address, transactions]);

  // const isUnViewedTransactions = useMemo(() => {
  //   const _transactionsForAddress = transactions[address];
  //   if (_transactionsForAddress) {
  //     const unViewed = _transactionsForAddress.filter((t) => {
  //       return t.isViewed === false;
  //     });
  //
  //     const pending = unViewed.filter((t) => {
  //       return t.status === RecentTransactionStatus.PENDING;
  //     });
  //
  //     const failed = unViewed.filter((t) => {
  //       return t.status === RecentTransactionStatus.ERROR;
  //     });
  //
  //     const success = unViewed.filter((t) => {
  //       return t.status === RecentTransactionStatus.SUCCESS;
  //     });
  //
  //     return {
  //       isUnViewed: Boolean(unViewed.length),
  //       pending,
  //       failed,
  //       success,
  //       totalUnViewed: unViewed.length,
  //     };
  //   }
  //
  //   return { isUnViewed: false };
  // }, [address, transactions]);

  const waitForTransaction = useCallback(
    async (hash: `0x${string}`, id: string, title: IRecentTransactionTitle) => {
      if (!publicClient || !address) {
        return;
      }

      try {
        const transaction = await publicClient.waitForTransactionReceipt({
          hash,
          onReplaced: (replacement) => {
            console.log(replacement);
          },
        });
        if (transaction.status === "success") {
          updateTransactionStatus(id, RecentTransactionStatus.SUCCESS, address);
          addNotification(title, RecentTransactionStatus.SUCCESS);
        } else if (transaction.status === "reverted") {
          updateTransactionStatus(id, RecentTransactionStatus.ERROR, address);
          addNotification(title, RecentTransactionStatus.ERROR);
        }
      } catch (e) {
        updateTransactionStatus(id, RecentTransactionStatus.ERROR, address);
        addNotification(title, RecentTransactionStatus.ERROR);
      }
    },
    [address, publicClient, updateTransactionStatus],
  );

  useEffect(() => {
    for (const transaction of transactionsForAddress) {
      if (
        transaction.status === RecentTransactionStatus.PENDING &&
        !trackingTransactions.includes(transaction.id)
      ) {
        waitForTransaction(transaction.hash, transaction.id, transaction.title);
        trackingTransactions.push(transaction.id);
      }
    }
  }, [transactionsForAddress, waitForTransaction]);
}
