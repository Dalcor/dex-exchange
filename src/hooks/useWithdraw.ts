import { useCallback, useEffect, useState } from "react";
import { Address, formatUnits, getAbiItem } from "viem";
import {
  useAccount,
  useBlockNumber,
  usePublicClient,
  useReadContract,
  useWalletClient,
} from "wagmi";

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

export default function useWithdraw({
  token,
  contractAddress,
}: {
  token: Token | undefined;
  contractAddress: Address | undefined;
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
  const amountToWithdraw = currentDeposit.data as bigint;

  const { data: blockNumber } = useBlockNumber({ watch: true });

  useEffect(() => {
    currentDeposit.refetch();
  }, [currentDeposit, blockNumber]);

  const writeTokenWithdraw = useCallback(
    async (customAmount?: bigint) => {
      if (
        !amountToWithdraw ||
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

      if (!token) return;
      const amount = customAmount || amountToWithdraw;
      try {
        const params = {
          account: address as Address,
          abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
          functionName: "withdraw" as "withdraw",
          address: contractAddress,
          args: [token.address1 as Address, address as Address, amount] as [
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
              abi: [getAbiItem({ name: "withdraw", abi: NONFUNGIBLE_POSITION_MANAGER_ABI })],
            },
            title: {
              symbol: token.symbol!,
              template: RecentTransactionTitleTemplate.WITHDRAW,
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
      amountToWithdraw,
      contractAddress,
      token,
      walletClient,
      address,
      chainId,
      publicClient,
      addRecentTransaction,
    ],
  );

  const [estimatedGas, setEstimatedGas] = useState(null as null | bigint);
  useEffect(() => {
    IIFE(async () => {
      if (
        !amountToWithdraw ||
        !contractAddress ||
        !token ||
        !walletClient ||
        !address ||
        !chainId ||
        !publicClient
      ) {
        return;
      }

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

      try {
        const estimatedGas = await publicClient.estimateContractGas(params);
        setEstimatedGas(estimatedGas);
      } catch (error) {
        console.warn("🚀 ~ useWithdraw ~ estimatedGas ~ error:", error, "params:", params);
        setEstimatedGas(null);
      }
    });
  }, [amountToWithdraw, contractAddress, token, walletClient, address, chainId, publicClient]);

  return {
    withdrawStatus: status,
    withdrawHandler: writeTokenWithdraw,
    estimatedGas,
    currentDeposit: currentDeposit.data as bigint,
  };
}
