import { useCallback, useEffect, useMemo } from "react";
import { useAccount, usePublicClient } from "wagmi";

import {
  RecentTransactionStatus,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";

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
    async (hash: `0x${string}`, id: string) => {
      if (!publicClient || !address) {
        return;
      }

      const transaction = await publicClient.waitForTransactionReceipt({ hash });
      if (transaction.status === "success") {
        updateTransactionStatus(id, RecentTransactionStatus.SUCCESS, address);
      }

      if (transaction.status === "reverted") {
        updateTransactionStatus(id, RecentTransactionStatus.ERROR, address);
      }

      // setIsViewed(id, address, false);
    },
    [address, publicClient, updateTransactionStatus],
  );

  useEffect(() => {
    for (const transaction of transactionsForAddress) {
      if (transaction.status === RecentTransactionStatus.PENDING) {
        waitForTransaction(transaction.hash, transaction.id);
      }
    }
  }, [transactionsForAddress, waitForTransaction]);

  // return isUnViewedTransactions;
}
