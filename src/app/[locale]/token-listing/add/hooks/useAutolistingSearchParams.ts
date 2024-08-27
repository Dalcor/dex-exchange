import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { isAddress } from "viem";

import { useAutoListingContractStore } from "@/app/[locale]/token-listing/add/stores/useAutoListingContractStore";
import { usePathname } from "@/navigation";

enum AutoListingQueryParams {
  autoListingContract = "autoListingContract",
}

export const useAutoListingSearchParams = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const locale = useLocale();
  const _pathname = usePathname();
  const pathname = `/${locale}${_pathname}`;
  const searchParams = useSearchParams();

  const { autoListingContract, setAutoListingContract } = useAutoListingContractStore();

  const currentPath = useMemo(() => {
    return searchParams.toString() ? pathname + "?" + searchParams.toString() : pathname;
  }, [searchParams, pathname]);

  const updatedPath = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (autoListingContract) {
      params.set(AutoListingQueryParams.autoListingContract, autoListingContract);
    } else {
      params.delete(AutoListingQueryParams.autoListingContract);
    }

    return pathname + "?" + params.toString();
  }, [autoListingContract, pathname, searchParams]);

  useEffect(() => {
    if (!isInitialized) {
      const queryAutoListingContract = searchParams.get(AutoListingQueryParams.autoListingContract);

      if (queryAutoListingContract && isAddress(queryAutoListingContract)) {
        setAutoListingContract(queryAutoListingContract);
      }

      setIsInitialized(true);
    }
  }, [searchParams, isInitialized, setAutoListingContract]);
  useEffect(() => {
    if (isInitialized) {
      if (currentPath !== updatedPath) {
        window.history.pushState(null, "", updatedPath);
      }
    }
  }, [currentPath, updatedPath, isInitialized]);
};
