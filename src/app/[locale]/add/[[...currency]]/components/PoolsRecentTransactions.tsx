import Image from "next/image";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";

import SystemIconButton from "@/components/buttons/SystemIconButton";
import Pagination from "@/components/others/Pagination";
import RecentTransaction from "@/components/others/RecentTransaction";
import { useRecentTransactionsStore } from "@/stores/useRecentTransactionsStore";

const PAGE_SIZE = 5;

export const PoolsRecentTransactions = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { address } = useAccount();

  const { transactions } = useRecentTransactionsStore();

  const _transactions = useMemo(() => {
    if (address && transactions[address]) {
      return transactions[address];
    }

    return [];
  }, [address, transactions]);

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PAGE_SIZE;
    const lastPageIndex = firstPageIndex + PAGE_SIZE;
    return _transactions.slice(firstPageIndex, lastPageIndex);
  }, [_transactions, currentPage]);

  if (!isOpen) return null;
  return (
    <div className="px-10 pt-2.5 pb-5 bg-primary-bg rounded-5 mt-5">
      <div className="flex justify-between items-center mb-2.5">
        <h3 className="font-bold text-20">Transactions</h3>
        <div className="flex items-center">
          <SystemIconButton iconSize={24} iconName="close" onClick={onClose} />
        </div>
      </div>
      <div>
        {currentTableData.length ? (
          <>
            <div className="pb-5 flex flex-col gap-1">
              {currentTableData.map((transaction) => {
                return <RecentTransaction transaction={transaction} key={transaction.hash} />;
              })}
            </div>
            <Pagination
              className="pagination-bar"
              currentPage={currentPage}
              totalCount={_transactions.length}
              pageSize={PAGE_SIZE}
              onPageChange={(page) => setCurrentPage(page as number)}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[324px] gap-2">
            <Image src="/empty/empty-history.svg" width={80} height={80} alt="" />
            <span className="text-secondary-text">All transaction will be displayed here.</span>
          </div>
        )}
      </div>
    </div>
  );
};
