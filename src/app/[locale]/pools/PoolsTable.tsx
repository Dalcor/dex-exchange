import clsx from "clsx";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { Address } from "viem";

import Preloader from "@/components/atoms/Preloader";
import IconButton, {
  IconButtonSize,
  IconButtonVariant,
  IconSize,
} from "@/components/buttons/IconButton";
import Pagination from "@/components/common/Pagination";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useRouter } from "@/navigation";

import { usePoolsData } from "./hooks";

export enum SortingType {
  NONE,
  ASCENDING,
  DESCENDING,
}

const GQLSorting: { [index: number]: "asc" | "desc" | undefined } = {
  [SortingType.NONE]: undefined,
  [SortingType.ASCENDING]: "asc",
  [SortingType.DESCENDING]: "desc",
};

function HeaderItem({
  isFirst = false,
  label,
  sorting,
  handleSort,
}: {
  isFirst?: boolean;
  label: string;
  handleSort?: () => void;
  sorting: SortingType;
}) {
  return (
    <div
      role={handleSort && "button"}
      onClick={handleSort}
      className={clsx("h-[60px] flex items-center relative -left-3 mb-2", isFirst && "pl-2")}
    >
      {handleSort && (
        <IconButton
          variant={IconButtonVariant.SORTING}
          buttonSize={IconButtonSize.SMALL}
          iconSize={IconSize.SMALL}
          sorting={sorting}
        />
      )}
      {label}
    </div>
  );
}

const PAGE_SIZE = 10;

export default function PoolsTable({
  filter,
}: {
  filter?: {
    token0Address?: Address;
    token1Address?: Address;
  };
}) {
  const [sorting, setSorting] = useState<SortingType>(SortingType.NONE);

  const handleSort = useCallback(() => {
    switch (sorting) {
      case SortingType.NONE:
        setSorting(SortingType.ASCENDING);
        return;
      case SortingType.ASCENDING:
        setSorting(SortingType.DESCENDING);
        return;
      case SortingType.DESCENDING:
        setSorting(SortingType.NONE);
        return;
    }
  }, [sorting]);

  const [currentPage, setCurrentPage] = useState(1);

  const chainId = useCurrentChainId();
  const { data, loading, ...restData } = usePoolsData({
    chainId,
    orderDirection: GQLSorting[sorting],
    filter,
  });
  console.log("🚀 ~ Pools ~ data:", data);
  console.log("🚀 ~ Pools ~ restData:", restData);
  const pools = useMemo(() => data?.pools || [], [data?.pools]);

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PAGE_SIZE;
    const lastPageIndex = firstPageIndex + PAGE_SIZE;
    return pools.slice(firstPageIndex, lastPageIndex);
  }, [pools, currentPage]);
  console.log("🚀 ~ currentTableData ~ currentTableData:", currentTableData);
  const router = useRouter();

  const openPoolHandler = (poolAddress: Address) => {
    router.push(`/pools/${chainId}/${poolAddress}`);
  };

  return (
    <>
      <div className="min-h-[640px] mb-5 w-full">
        <div className="pr-5 pl-2 grid rounded-2 overflow-hidden gap-x-2 bg-table-gradient grid-cols-[_minmax(20px,0.5fr),minmax(50px,2.67fr),_minmax(87px,1.33fr),_minmax(55px,1.33fr),_minmax(50px,1.33fr),_minmax(50px,1.33fr)] pb-2">
          <div className=" h-[60px] flex items-center justify-center">#</div>
          <div className=" h-[60px] flex items-center">Pool</div>
          <HeaderItem label="Transactions" sorting={sorting} handleSort={handleSort} />
          <div className=" h-[60px] flex items-center">TVL</div>
          <div className=" h-[60px] flex items-center">1 day volume</div>
          <div className=" h-[60px] flex items-center">7 day volume</div>

          {!loading &&
            currentTableData.map((o: any, index: number) => {
              return (
                <>
                  <div
                    onClick={() => openPoolHandler(o.id)}
                    className="h-[56px] cursor-pointer flex items-center justify-center"
                  >
                    {(currentPage - 1) * PAGE_SIZE + index + 1}
                  </div>
                  <div
                    onClick={() => openPoolHandler(o.id)}
                    className="h-[56px] cursor-pointer flex items-center gap-2"
                  >
                    <Image src="/tokens/placeholder.svg" width={24} height={24} alt="" />
                    <Image
                      src="/tokens/placeholder.svg"
                      width={24}
                      height={24}
                      alt=""
                      className="-ml-5 bg-primary-bg rounded-full"
                    />
                    <span>{`${o.token0.symbol}/${o.token1.symbol}`}</span>
                  </div>
                  <div
                    onClick={() => openPoolHandler(o.id)}
                    className="h-[56px] cursor-pointer flex items-center"
                  >
                    {o.txCount}
                  </div>
                  <div
                    onClick={() => openPoolHandler(o.id)}
                    className="h-[56px] cursor-pointer flex items-center"
                  >
                    ${o.totalValueLockedUSD}
                  </div>
                  <div
                    onClick={() => openPoolHandler(o.id)}
                    className="h-[56px] cursor-pointer flex items-center"
                  >
                    ${o.poolDayData?.[0]?.volumeUSD || 0}
                  </div>
                  <div
                    onClick={() => openPoolHandler(o.id)}
                    className="h-[56px] cursor-pointer flex items-center"
                  >
                    $0
                  </div>
                </>
              );
            })}
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-full min-h-[550px]">
            <Preloader type="awaiting" size={48} />
          </div>
        ) : null}
      </div>

      <Pagination
        className="pagination-bar"
        currentPage={currentPage}
        totalCount={pools.length}
        pageSize={PAGE_SIZE}
        onPageChange={(page) => setCurrentPage(page as number)}
      />
    </>
  );
}
