import { useCallback, useEffect, useMemo, useState } from "react";
import { Abi, Address, formatUnits, getAbiItem, parseUnits } from "viem";
import {
  useAccount,
  useBlockNumber,
  usePublicClient,
  useReadContract,
  useWalletClient,
} from "wagmi";

import { ERC20_ABI } from "@/config/abis/erc20";
import { IIFE } from "@/functions/iife";
import addToast from "@/other/toast";
import { Token } from "@/sdk_hybrid/entities/token";
import {
  GasFeeModel,
  RecentTransactionTitleTemplate,
  stringifyObject,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";

export enum AllowanceStatus {
  INITIAL,
  PENDING,
  LOADING,
  SUCCESS,
}
export default function useAllowance({
  token,
  contractAddress,
  amountToCheck,
}: {
  token: Token | undefined;
  contractAddress: Address | undefined;
  amountToCheck: bigint | null;
}) {
  const [status, setStatus] = useState(AllowanceStatus.INITIAL);
  const [revokeStatus, setRevokeStatus] = useState(AllowanceStatus.INITIAL);

  const { address, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { addRecentTransaction } = useRecentTransactionsStore();

  const { refetch, data: currentAllowanceData } = useReadContract({
    abi: ERC20_ABI,
    address: token?.address0 as Address,
    functionName: "allowance",
    args: [
      //set ! to avoid ts errors, make sure it is not undefined with "enable" option
      address!,
      contractAddress!,
    ],
    query: {
      //make sure hook don't run when there is no addresses
      enabled: Boolean(token?.address0) && Boolean(address) && Boolean(contractAddress),
    },
    // cacheTime: 0,
    // watch: true,
  });

  const { data: blockNumber } = useBlockNumber({ watch: true });

  useEffect(() => {
    refetch();
  }, [refetch, blockNumber]);

  // TODO: mb change isAllowed to one of status AllowanceStatus
  const isAllowed = useMemo(() => {
    if (!token) {
      return false;
    }

    // if (isNativeToken(token.address)) {
    //   return true;
    // }

    if (currentAllowanceData && amountToCheck) {
      return currentAllowanceData >= amountToCheck;
    }

    return false;
  }, [amountToCheck, currentAllowanceData, token]);

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

  const writeTokenApprove = useCallback(async () => {
    if (
      !amountToCheck ||
      !contractAddress ||
      !token ||
      !walletClient ||
      !address ||
      !chainId ||
      !publicClient
    ) {
      console.error("Error: writeTokenApprove ~ something undefined");
      return;
    }

    setStatus(AllowanceStatus.PENDING);

    const params: {
      address: Address;
      account: Address;
      abi: Abi;
      functionName: "approve";
      args: [Address, bigint];
    } = {
      address: token.address0 as Address,
      account: address,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [contractAddress!, amountToCheck!],
    };

    try {
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
            abi: [getAbiItem({ name: "approve", abi: ERC20_ABI })],
          },
          title: {
            symbol: token.symbol!,
            template: RecentTransactionTitleTemplate.APPROVE,
            amount: formatUnits(amountToCheck, token.decimals),
            logoURI: token?.logoURI || "/tokens/placeholder.svg",
          },
        },
        address,
      );

      if (hash) {
        setStatus(AllowanceStatus.LOADING);
        await publicClient.waitForTransactionReceipt({ hash });
        setStatus(AllowanceStatus.SUCCESS);
        return { success: true };
      }
    } catch (e) {
      console.log(e);
      setStatus(AllowanceStatus.INITIAL);
      addToast("Unexpected error, please contact support", "error");
      return { success: false };
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

  const writeTokenRevoke = useCallback(async () => {
    const amountToRevoke = BigInt(0);
    if (!contractAddress || !token || !walletClient || !address || !chainId || !publicClient) {
      return;
    }

    setRevokeStatus(AllowanceStatus.PENDING);

    const params: {
      address: Address;
      account: Address;
      abi: Abi;
      functionName: "approve";
      args: [Address, bigint];
    } = {
      address: token.address0 as Address,
      account: address,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [contractAddress!, amountToRevoke!],
    };

    try {
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
            abi: [getAbiItem({ name: "approve", abi: ERC20_ABI })],
          },
          title: {
            symbol: token.symbol!,
            template: RecentTransactionTitleTemplate.APPROVE,
            amount: formatUnits(amountToRevoke, token.decimals),
            logoURI: token?.logoURI || "/tokens/placeholder.svg",
          },
        },
        address,
      );

      if (hash) {
        setRevokeStatus(AllowanceStatus.LOADING);
        await publicClient.waitForTransactionReceipt({ hash });
        setRevokeStatus(AllowanceStatus.SUCCESS);
      }
    } catch (e) {
      console.log(e);
      setStatus(AllowanceStatus.INITIAL);
      addToast("Unexpected error, please contact support", "error");
    }
  }, [contractAddress, token, walletClient, address, chainId, publicClient, addRecentTransaction]);

  const [estimatedGas, setEstimatedGas] = useState(null as null | bigint);
  useEffect(() => {
    IIFE(async () => {
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

      const params: {
        address: Address;
        account: Address;
        abi: Abi;
        functionName: "approve";
        args: [Address, bigint];
      } = {
        address: token.address0 as Address,
        account: address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [contractAddress!, amountToCheck!],
      };

      try {
        const estimatedGas = await publicClient.estimateContractGas(params);
        setEstimatedGas(estimatedGas);
      } catch (error) {
        console.error("~ estimatedGas ~ error:", error);
        setEstimatedGas(null);
      }
    });
  }, [amountToCheck, contractAddress, token, walletClient, address, chainId, publicClient]);

  return {
    isAllowed,
    status,
    revokeStatus,
    isLoading: status === AllowanceStatus.LOADING,
    isPending: status === AllowanceStatus.PENDING,
    writeTokenApprove,
    writeTokenRevoke,
    currentAllowance: currentAllowanceData,
    estimatedGas,
  };
}
