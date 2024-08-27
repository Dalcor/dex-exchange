import { useCallback, useEffect } from "react";
import { useReadContract, useWalletClient } from "wagmi";

import { useAutoListingContractStore } from "@/app/[locale]/token-listing/add/stores/useAutoListingContractStore";
import { useListTokensStore } from "@/app/[locale]/token-listing/add/stores/useListTokensStore";
import { NONPAYABLE_AUTOLISTING_ABI, PAYABLE_AUTOLISTING_ABI } from "@/config/abis/autolisting";
import { FeeAmount } from "@/sdk_hybrid/constants";
import { useComputePoolAddressDex } from "@/sdk_hybrid/utils/computePoolAddress";

export default function useListToken() {
  const { tokenA, tokenB } = useListTokensStore();
  const { autoListingContract } = useAutoListingContractStore();

  const { poolAddress, poolAddressLoading } = useComputePoolAddressDex({
    tokenA,
    tokenB,
    tier: FeeAmount.MEDIUM,
  });

  const { data: walletClient } = useWalletClient();

  const handleList = useCallback(async () => {
    if (!poolAddress || !walletClient) {
      return;
    }

    const hash = await walletClient.writeContract({
      address: autoListingContract,
      abi: NONPAYABLE_AUTOLISTING_ABI,
      functionName: "list",
      args: [poolAddress, FeeAmount.MEDIUM],
    } as any); // TODO: remove any

    console.log(hash);
  }, [autoListingContract, poolAddress, walletClient]);

  return { handleList };
}
