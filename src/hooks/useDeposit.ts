import { useCallback, useEffect, useMemo, useState } from "react";
// import { isNativeToken } from "@/other/isNativeToken";
import { Address } from "viem";
import {
  useAccount,
  useBlockNumber,
  usePublicClient,
  useReadContract,
  useWalletClient,
} from "wagmi";

import { ERC223_ABI } from "@/config/abis/erc223";
import { NONFUNGIBLE_POSITION_MANAGER_ABI } from "@/config/abis/nonfungiblePositionManager";
import { nonFungiblePositionManagerAddress } from "@/config/contracts";
// import { useRecentTransactionsStore } from "@/stores/useRecentTransactions";
// import { useAwaitingDialogStore } from "@/stores/useAwaitingDialogStore";
import { WrappedToken } from "@/config/types/WrappedToken";
import addToast from "@/other/toast";

export default function useDeposit({
  token,
  contractAddress,
  amountToCheck,
}: {
  token: WrappedToken | undefined;
  contractAddress: Address | undefined;
  amountToCheck: bigint | null;
}) {
  const { address } = useAccount();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  // const {addTransaction} = useRecentTransactionsStore();
  const { chainId } = useAccount();
  // const {setOpened, setSubmitted, setClose} = useAwaitingDialogStore();

  const currentDeposit = useReadContract({
    address: nonFungiblePositionManagerAddress,
    abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
    functionName: "depositedTokens",
    args: address && token && [address, token.address as Address],
    query: {
      enabled: Boolean(address) && Boolean(token?.address),
    },
  });
  console.log(`🚀 ~ useDeposit balance ${token?.symbol}:`, currentDeposit.data);

  const { data: blockNumber } = useBlockNumber({ watch: true });

  useEffect(() => {
    currentDeposit.refetch();
  }, [currentDeposit, blockNumber]);

  const isDeposited = useMemo(() => {
    if (!token) {
      return false;
    }

    // if (isNativeToken(token.address)) {
    //   return true;
    // }

    if (currentDeposit?.data && amountToCheck) {
      return currentDeposit.data >= amountToCheck;
    }

    return false;
  }, [amountToCheck, currentDeposit?.data, token]);

  // const { data: simulateData } = useSimulateContract({
  //   address: tokenAddress,
  //   abi: ERC20_ABI,
  //   functionName: "approve",
  //   args: [
  //     contractAddress!,
  //     amountToCheck!
  //   ],
  //   query: {
  //     enabled: Boolean(amountToCheck) && Boolean(contractAddress)
  //   }
  //   // cacheTime: 0,
  // });

  // const {
  //   data: approvingData,
  //   writeContract: writeTokenApprove
  // } = useWriteContract();

  const [isDepositing, setIsDepositing] = useState(false);

  const writeTokenDeposit = useCallback(async () => {
    if (
      !amountToCheck ||
      !contractAddress ||
      !token ||
      !walletClient ||
      !address ||
      !chainId ||
      !publicClient
    ) {
      return;
    }

    setIsDepositing(true);
    // setOpened(`Approve ${formatUnits(amountToCheck, token.decimals)} ${token.symbol} tokens`)

    if (!token) return;
    try {
      // const estimatedGas = await publicClient.estimateContractGas(params);

      // const { request } = await publicClient.simulateContract({
      //   ...params,
      //   gas: estimatedGas + BigInt(30000),
      // });
      // const hash = await walletClient.writeContract(request);

      const hash = await walletClient.writeContract({
        account: address,
        abi: ERC223_ABI,
        functionName: "transfer",
        address: token.address as Address,
        args: [contractAddress, amountToCheck],
      });

      if (hash) {
        // addTransaction({
        //   account: address,
        //   hash,
        //   chainId,
        //   title: `Approve ${formatUnits(amountToCheck, token.decimals)} ${token.symbol} tokens`,
        // }, address);
        // setSubmitted(hash, chainId as any);

        await publicClient.waitForTransactionReceipt({ hash });
        setIsDepositing(false);
      }
    } catch (e) {
      console.log(e);
      // setClose();
      setIsDepositing(false);
      addToast("Unexpected error, please contact support", "error");
    }
  }, [address, amountToCheck, chainId, contractAddress, token, publicClient, walletClient]);

  return {
    isDeposited,
    isDepositing,
    writeTokenDeposit,
    currentDeposit: currentDeposit.data,
  };
}
