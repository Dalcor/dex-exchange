import { useBlock } from "wagmi";
import { useMemo  } from "react";

export default function useTransactionDeadline(userDeadline: number): bigint {
  const ttl = userDeadline * 60;

  const { data: block } = useBlock();

  return useMemo(
    () => {
      if(block) {
        return block.timestamp + BigInt(ttl);
      }

      return BigInt(0)
    },
    [block, ttl]
  );
}
