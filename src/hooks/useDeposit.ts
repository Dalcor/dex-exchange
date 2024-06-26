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
import addToast from "@/other/toast";
import { Token } from "@/sdk_hybrid/entities/token";
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
  token: Token | undefined;
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
    args: address && token && [address, token.address1 as Address],
    query: {
      enabled: Boolean(address) && Boolean(token?.address1),
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
      return (currentDeposit.data as bigint) >= amountToCheck;
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
      return;
    }

    setIsDepositing(true);
    // setOpened(`Approve ${formatUnits(amountToCheck, token.decimals)} ${token.symbol} tokens`)

    try {
      const params = {
        account: address as Address,
        abi: ERC223_ABI,
        functionName: "transfer" as "transfer",
        address: token.address1 as Address,
        args: [contractAddress, amountToCheck] as any,
      };

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
    const amountToWithdraw = currentDeposit.data as bigint;

    setIsWithdrawing(true);
    // setOpened(`Approve ${formatUnits(amountToWithdraw, token.decimals)} ${token.symbol} tokens`)

    if (!token) return;
    try {
      const params = {
        account: address as Address,
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        functionName: "withdraw" as "withdraw",
        address: contractAddress,
        args: [token.address1 as Address, address as Address, amountToWithdraw] as [
          Address,
          Address,
          bigint,
        ],
      };

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
            abi: [getAbiItem({ name: "withdraw", abi: NONFUNGIBLE_POSITION_MANAGER_ABI })],
          },
          title: {
            symbol: token.symbol!,
            template: RecentTransactionTitleTemplate.WITHDRAW,
            amount: formatUnits(amountToWithdraw, token.decimals),
            logoURI: token?.logoURI || "/tokens/placeholder.svg",
          },
        },
        address,
      );

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
  }, [
    currentDeposit.data,
    contractAddress,
    token,
    walletClient,
    address,
    chainId,
    publicClient,
    addRecentTransaction,
  ]);

  return {
    isDeposited,
    isDepositing,
    isWithdrawing,
    writeTokenDeposit,
    writeTokenWithdraw,
    currentDeposit: currentDeposit.data as bigint,
  };
}
