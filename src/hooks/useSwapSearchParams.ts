import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { useSwapTokensStore } from "@/app/[locale]/swap/stores/useSwapTokensStore";
import { usePathname } from "@/navigation";

import { useTokens } from "./useTokenLists";

enum SwapQueryParams {
  tokenA = "tokenA",
  tokenB = "tokenB",
}

export const useSwapSearchParams = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const locale = useLocale();
  const _pathname = usePathname();
  const pathname = `/${locale}${_pathname}`;
  const searchParams = useSearchParams();
  const tokens = useTokens();

  const { tokenA, tokenB, setTokenA, setTokenB } = useSwapTokensStore();

  const currentPath = useMemo(() => {
    return searchParams.toString() ? pathname + "?" + searchParams.toString() : pathname;
  }, [searchParams, pathname]);

  const updatedPath = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (tokenA?.address0) {
      params.set(SwapQueryParams.tokenA, tokenA?.address0);
    } else {
      params.delete(SwapQueryParams.tokenA);
    }
    if (tokenB?.address0) {
      params.set(SwapQueryParams.tokenB, tokenB.address0);
    } else {
      params.delete(SwapQueryParams.tokenB);
    }

    return pathname + "?" + params.toString();
  }, [pathname, searchParams, tokenA, tokenB]);

  useEffect(() => {
    if (!isInitialized && tokens.length) {
      const queryTokenA = searchParams.get(SwapQueryParams.tokenA);
      const queryTokenB = searchParams.get(SwapQueryParams.tokenB);

      if (queryTokenA) {
        const token = tokens.find((t) => t.address0 === queryTokenA);
        if (token) {
          setTokenA(token);
        }
      }
      if (queryTokenB) {
        const token = tokens.find((t) => t.address0 === queryTokenB);
        if (token) {
          setTokenB(token);
        }
      }

      setIsInitialized(true);
    }
  }, [searchParams, tokens, setTokenA, setTokenB, isInitialized]);
  useEffect(() => {
    if (isInitialized) {
      if (currentPath !== updatedPath) {
        window.history.pushState(null, "", updatedPath);
      }
    }
  }, [currentPath, updatedPath, isInitialized]);
};
