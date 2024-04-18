import Image from "next/image";
import React, { useMemo, useState } from "react";
import { useAccount } from "wagmi";

import SystemIconButton from "@/components/buttons/SystemIconButton";
import Pagination from "@/components/others/Pagination";
import RecentTransaction from "@/components/others/RecentTransaction";
import { useRecentTransactionsStore } from "@/stores/useRecentTransactionsStore";

const PAGE_SIZE = 10;

interface Props {
  showRecentTransactions: boolean;
  handleClose: () => void;
  pageSize?: number;
}
export default function RecentTransactions({
  showRecentTransactions,
  handleClose,
  pageSize = PAGE_SIZE,
}: Props) {
  const { transactions } = useRecentTransactionsStore();
  const { address } = useAccount();

  const _transactions = useMemo(() => {
    if (address && transactions[address]) {
      return [...transactions[address]];
    }

    return [];
  }, [address, transactions]);

  const [currentPage, setCurrentPage] = useState(1);

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return _transactions.slice(firstPageIndex, lastPageIndex);
  }, [_transactions, currentPage, pageSize]);

  return (
    <>
      {showRecentTransactions && (
        <div>
          <div className="px-10 pt-2.5 pb-5 bg-primary-bg rounded-5">
            <div className="flex justify-between items-center mb-2.5">
              <h3 className="font-bold text-20">Transactions</h3>
              <div className="flex items-center">
                <SystemIconButton iconSize={24} iconName="close" onClick={handleClose} />
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
                    pageSize={pageSize}
                    onPageChange={(page) => setCurrentPage(page as number)}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[324px] gap-2">
                  <Image src="/empty/empty-history.svg" width={80} height={80} alt="" />
                  <span className="text-secondary-text">
                    All transaction will be displayed here.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
