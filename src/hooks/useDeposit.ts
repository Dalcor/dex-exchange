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
import { formatFloat } from "@/functions/formatFloat";
import { IIFE } from "@/functions/iife";
import addToast from "@/other/toast";
import { Token } from "@/sdk_hybrid/entities/token";
import {
  GasFeeModel,
  RecentTransactionTitleTemplate,
  stringifyObject,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";

import { AllowanceStatus } from "./useAllowance";
import useCurrentChainId from "./useCurrentChainId";
import useDeepEffect from "./useDeepEffect";

export default function useDeposit({
  token,
  contractAddress,
  amountToCheck,
}: {
  token: Token | undefined;
  contractAddress: Address | undefined;
  amountToCheck: bigint | null;
}) {
  const [status, setStatus] = useState(AllowanceStatus.INITIAL);

  const { address } = useAccount();
  const chainId = useCurrentChainId();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

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

  const writeTokenDeposit = useCallback(
    async (customAmount?: bigint) => {
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

      setStatus(AllowanceStatus.PENDING);

      // customAmount — is amount provided by user in approve amount input
      const amount = customAmount || amountToCheck;

      try {
        const params = {
          account: address as Address,
          abi: ERC223_ABI,
          functionName: "transfer" as "transfer",
          address: token.address1 as Address,
          args: [contractAddress, amount] as any,
        };

        const estimatedGas = await publicClient.estimateContractGas(params);

        const { request } = await publicClient.simulateContract({
          ...params,
          gas: estimatedGas + BigInt(30000),
        });
        const hash = await walletClient.writeContract({ ...request, account: undefined });

        const transaction = await publicClient.getTransaction({
          hash,
        });

        const nonce = transaction.nonce;

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
              amount: formatFloat(formatUnits(amount, token.decimals)),
              logoURI: token?.logoURI || "/tokens/placeholder.svg",
            },
          },
          address,
        );

        if (hash) {
          setStatus(AllowanceStatus.LOADING);
          await publicClient.waitForTransactionReceipt({ hash });
          setStatus(AllowanceStatus.SUCCESS);
        }
      } catch (e) {
        console.log(e);
        setStatus(AllowanceStatus.INITIAL);
        addToast("Unexpected error, please contact support", "error");
      }
    },
    [
      amountToCheck,
      contractAddress,
      token,
      walletClient,
      address,
      chainId,
      publicClient,
      addRecentTransaction,
    ],
  );

  const [estimatedGas, setEstimatedGas] = useState(BigInt(101000) as null | bigint);
  useDeepEffect(() => {
    IIFE(async () => {
      if (!amountToCheck || !contractAddress || !token || !publicClient) {
        return;
      }

      const params = {
        account: (address as Address) || contractAddress,
        abi: ERC223_ABI,
        functionName: "transfer" as const,
        address: token.address1 as Address,
        args: [contractAddress, amountToCheck] as any,
      };

      try {
        const estimatedGas = await publicClient.estimateContractGas(params);
        setEstimatedGas(estimatedGas);
      } catch (error) {
        console.warn("🚀 ~ useDeposit ~ estimatedGas ~ error:", error, "params:", params);
        setEstimatedGas(BigInt(101000));
      }
    });
  }, [amountToCheck, contractAddress, token, address, publicClient]);

  return {
    isDeposited,
    status,
    isLoading: status === AllowanceStatus.LOADING,
    isPending: status === AllowanceStatus.PENDING,
    writeTokenDeposit,
    currentDeposit: currentDeposit.data as bigint,
    estimatedGas,
  };
}
