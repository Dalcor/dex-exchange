import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { useAddLiquidityTokensStore } from "@/app/[locale]/add/stores/useAddLiquidityTokensStore";
import { useLiquidityTierStore } from "@/app/[locale]/add/stores/useLiquidityTierStore";
import { usePathname } from "@/navigation";

import { useTokens } from "./useTokenLists";

enum PoolsQueryParams {
  tokenA = "tokenA",
  tokenB = "tokenB",
  tier = "tier",
}

export const usePoolsSearchParams = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const locale = useLocale();
  const _pathname = usePathname();
  const pathname = `/${locale}${_pathname}`;
  const searchParams = useSearchParams();
  const tokens = useTokens();

  const { tokenA, tokenB, setTokenA, setTokenB } = useAddLiquidityTokensStore();
  const { tier, setTier } = useLiquidityTierStore();

  const currentPath = useMemo(() => {
    return searchParams.toString() ? pathname + "?" + searchParams.toString() : pathname;
  }, [searchParams, pathname]);

  const updatedPath = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (tokenA?.address0) {
      params.set(PoolsQueryParams.tokenA, tokenA?.address0);
    } else {
      params.delete(PoolsQueryParams.tokenA);
    }
    if (tokenB?.address0) {
      params.set(PoolsQueryParams.tokenB, tokenB.address0);
    } else {
      params.delete(PoolsQueryParams.tokenB);
    }
    params.set(PoolsQueryParams.tier, tier.toString());

    return pathname + "?" + params.toString();
  }, [pathname, searchParams, tokenA, tokenB, tier]);

  useEffect(() => {
    if (!isInitialized && tokens.length) {
      const queryTokenA = searchParams.get(PoolsQueryParams.tokenA);
      const queryTokenB = searchParams.get(PoolsQueryParams.tokenB);
      const queryTier = searchParams.get(PoolsQueryParams.tier);
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
      if (queryTier) {
        // TODO add check
        setTier(queryTier as any);
      }

      setIsInitialized(true);
    }
  }, [searchParams, tokens, setTokenA, setTokenB, setTier, isInitialized]);
  useEffect(() => {
    if (isInitialized) {
      if (currentPath !== updatedPath) {
        window.history.pushState(null, "", updatedPath);
      }
    }
  }, [currentPath, updatedPath, isInitialized]);
};
