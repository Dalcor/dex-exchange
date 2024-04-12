import { useCallback, useEffect, useMemo, useState } from "react";
import { Address, formatUnits, getAbiItem } from "viem";
import {
  useAccount,
  useBlockNumber,
  usePublicClient,
  useReadContract,
  useWalletClient,
} from "wagmi";

import { ERC223_ABI } from "@/config/abis/erc223";
import { NONFUNGIBLE_POSITION_MANAGER_ABI } from "@/config/abis/nonfungiblePositionManager";
import { WrappedToken } from "@/config/types/WrappedToken";
import addToast from "@/other/toast";
import {
  GasFeeModel,
  RecentTransactionTitleTemplate,
  stringifyObject,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";

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
  const { chainId } = useAccount();
  // const {setOpened, setSubmitted, setClose} = useAwaitingDialogStore();

  const { addRecentTransaction } = useRecentTransactionsStore();

  const currentDeposit = useReadContract({
    address: contractAddress,
    abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
    functionName: "depositedTokens",
    args: address && token && [address, token.address as Address],
    query: {
      enabled: Boolean(address) && Boolean(token?.address),
    },
  });

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
      console.log("WRONG0");
      return;
    }

    setIsDepositing(true);
    // setOpened(`Approve ${formatUnits(amountToCheck, token.decimals)} ${token.symbol} tokens`)

    try {
      const params = {
        account: address as Address,
        abi: ERC223_ABI,
        functionName: "transfer" as "transfer",
        address: token.address as Address,
        args: [contractAddress, amountToCheck] as any,
      };

      console.log(1);
      const estimatedGas = await publicClient.estimateContractGas(params);

      const { request } = await publicClient.simulateContract({
        ...params,
        gas: estimatedGas + BigInt(30000),
      });
      const hash = await walletClient.writeContract(request);

      const nonce = await publicClient.getTransactionCount({
        address,
        blockTag: "pending",
      });

      addRecentTransaction(
        {
          hash,
          nonce,
          chainId,
          gas: {
            model: GasFeeModel.EIP1559,
            gas: (estimatedGas + BigInt(30000)).toString(),
            maxFeePerGas: undefined,
            maxPriorityFeePerGas: undefined,
          },
          params: {
            ...stringifyObject(params),
            abi: [getAbiItem({ name: "transfer", abi: ERC223_ABI })],
          },
          title: {
            symbol: token.symbol!,
            template: RecentTransactionTitleTemplate.DEPOSIT,
            amount: formatUnits(amountToCheck, token.decimals),
            logoURI: token?.logoURI || "/tokens/placeholder.svg",
          },
        },
        address,
      );

      if (hash) {
        await publicClient.waitForTransactionReceipt({ hash });
        setIsDepositing(false);
      }
    } catch (e) {
      console.log(e);
      // setClose();
      setIsDepositing(false);
      addToast("Unexpected error, please contact support", "error");
    }
  }, [
    amountToCheck,
    contractAddress,
    token,
    walletClient,
    address,
    chainId,
    publicClient,
    addRecentTransaction,
  ]);

  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const writeTokenWithdraw = useCallback(async () => {
    if (
      !currentDeposit?.data ||
      !contractAddress ||
      !token ||
      !walletClient ||
      !address ||
      !chainId ||
      !publicClient
    ) {
      return;
    }
    const amountToWithdraw = currentDeposit.data;

    setIsWithdrawing(true);
    // setOpened(`Approve ${formatUnits(amountToWithdraw, token.decimals)} ${token.symbol} tokens`)

    if (!token) return;
    try {
      const hash = await walletClient.writeContract({
        account: address,
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        functionName: "withdraw",
        address: contractAddress,
        args: [token.address as Address, address, amountToWithdraw],
      });

      // TODO add addRecentTransaction

      if (hash) {
        await publicClient.waitForTransactionReceipt({ hash });
        setIsWithdrawing(false);
      }
    } catch (e) {
      console.log(e);
      // setClose();
      setIsWithdrawing(false);
      addToast("Unexpected error, please contact support", "error");
    }
  }, [address, currentDeposit, chainId, contractAddress, token, publicClient, walletClient]);

  return {
    isDeposited,
    isDepositing,
    isWithdrawing,
    writeTokenDeposit,
    writeTokenWithdraw,
    currentDeposit: currentDeposit.data,
  };
}
