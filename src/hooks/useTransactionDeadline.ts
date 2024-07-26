import { useBlock } from "wagmi";

import useDeepMemo from "@/hooks/useDeepMemo";

export default function useTransactionDeadline(userDeadline: number): bigint {
  const ttl = userDeadline * 60;

  const { data: block } = useBlock();

  return useDeepMemo(() => {
    if (block) {
      return block.timestamp + BigInt(ttl);
    }

    return BigInt(0);
  }, [block, ttl]);
}
