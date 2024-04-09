import clsx from "clsx";

import Svg from "@/components/atoms/Svg";
import { DOTS, usePagination } from "@/hooks/usePagination";

interface Props {
  onPageChange: (page: number | string) => void;
  totalCount: number;
  siblingCount?: number;
  currentPage: number;
  pageSize: number;
  className?: string;
}
export default function Pagination({
  onPageChange,
  totalCount,
  siblingCount = 1,
  currentPage,
  pageSize,
  className,
}: Props) {
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  // If there are less than 2 times in pagination range we shall not render the component
  if (!paginationRange || currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  let lastPage = paginationRange[paginationRange.length - 1];
  return (
    <ul className="flex items-center gap-2 justify-center">
      {/* Left navigation arrow */}
      <li
        className={clsx(
          "text-primary-text w-12 h-12 hover:bg-green-bg rounded-full text-16 flex items-center duration-200 justify-center cursor-pointer",
          currentPage === 1 && "opacity-50 pointer-events-none",
        )}
        onClick={onPrevious}
      >
        <Svg className="rotate-90" iconName="small-expand-arrow" />
      </li>
      {paginationRange.map((pageNumber, index) => {
        // If the pageItem is a DOT, render the DOTS unicode character
        if (pageNumber === DOTS) {
          return (
            <li
              key={`${pageNumber}-${index}`}
              className="w-12 h-12 rounded-full text-16 flex items-center justify-center duration-200"
            >
              &#8230;
            </li>
          );
        }

        // Render our Page Pills
        return (
          <li
            key={`${pageNumber}-${index}`}
            className={clsx(
              "w-12 h-12 rounded-full text-16 cursor-pointer flex items-center justify-center duration-200",
              pageNumber === currentPage
                ? "bg-green text-black"
                : "bg-transparent hover:bg-green-bg text-primary-text",
            )}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </li>
        );
      })}
      {/*  Right Navigation arrow */}
      <li
        className={clsx(
          "text-primary-text w-12 h-12 rounded-full hover:bg-green-bg text-16 cursor-pointer duration-200 flex items-center justify-center",
          currentPage === lastPage && "opacity-50 pointer-events-none",
        )}
        onClick={onNext}
      >
        <Svg className="-rotate-90" iconName="small-expand-arrow" />
      </li>
    </ul>
  );
}
