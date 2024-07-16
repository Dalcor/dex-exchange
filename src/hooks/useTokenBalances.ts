import { useCallback } from "react";
import { useAccount, useBalance } from "wagmi";

import { Token } from "@/sdk_hybrid/entities/token";

export default function useTokenBalances(token: Token | undefined) {
  const { address } = useAccount();

  const { data: erc20Balance, refetch: refetch20 } = useBalance({
    address: token ? address : undefined,
    token: token ? token.address0 : undefined,
    query: {
      enabled: Boolean(token),
    },
  });
  const { data: erc223Balance, refetch: refetch223 } = useBalance({
    address: token ? address : undefined,
    token: token ? token.address1 : undefined,
    query: {
      enabled: Boolean(token),
    },
  });

  const refetch = useCallback(() => {
    refetch20();
    refetch223();
  }, [refetch20, refetch223]);

  return { balance: { erc20Balance, erc223Balance }, refetch };
}
