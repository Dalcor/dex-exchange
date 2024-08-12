import { useBlockNumber } from "wagmi";

export default function useScopedBlockNumber(args?: { watch?: boolean }) {
  return useBlockNumber({
    scopeKey: "global",
    watch: args?.watch || true,
  });
}
