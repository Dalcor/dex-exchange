import { useCallback, useEffect, useMemo, useState } from "react";
// import { isNativeToken } from "@/other/isNativeToken";
import { Abi, Address, formatUnits, getAbiItem, parseUnits } from "viem";
import {
  useAccount,
  useBlockNumber,
  usePublicClient,
  useReadContract,
  useWalletClient,
} from "wagmi";

import { ERC20_ABI } from "@/config/abis/erc20";
// import { useRecentTransactionsStore } from "@/stores/useRecentTransactions";
// import { useAwaitingDialogStore } from "@/stores/useAwaitingDialogStore";
import addToast from "@/other/toast";
import { Token } from "@/sdk_hybrid/entities/token";
import {
  GasFeeModel,
  RecentTransactionTitleTemplate,
  stringifyObject,
  useRecentTransactionsStore,
} from "@/stores/useRecentTransactionsStore";

export default function useAllowance({
  token,
  contractAddress,
  amountToCheck,
}: {
  token: Token | undefined;
  contractAddress: Address | undefined;
  amountToCheck: bigint | null;
}) {
  const { address, chainId } = useAccount();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  // const {addTransaction} = useRecentTransactionsStore();
  // const {setOpened, setSubmitted, setClose} = useAwaitingDialogStore();

  const { addRecentTransaction } = useRecentTransactionsStore();

  const currentAllowance = useReadContract({
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
    currentAllowance.refetch();
  }, [currentAllowance, blockNumber]);

  const isAllowed = useMemo(() => {
    if (!token) {
      return false;
    }

    // if (isNativeToken(token.address)) {
    //   return true;
    // }

    if (currentAllowance?.data && amountToCheck) {
      return currentAllowance.data >= amountToCheck;
    }

    return false;
  }, [amountToCheck, currentAllowance?.data, token]);

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

  const [isApproving, setIsApproving] = useState(false);

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
      return;
    }

    setIsApproving(true);
    // setOpened(`Approve ${formatUnits(amountToCheck, token.decimals)} ${token.symbol} tokens`)

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
        // addTransaction({
        //   account: address,
        //   hash,
        //   chainId,
        //   title: `Approve ${formatUnits(amountToCheck, token.decimals)} ${token.symbol} tokens`,
        // }, address);
        // setSubmitted(hash, chainId as any);

        await publicClient.waitForTransactionReceipt({ hash });
        setIsApproving(false);
      }
    } catch (e) {
      console.log(e);
      // setClose();
      setIsApproving(false);
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

  const [isRevoking, setIsRevoking] = useState(false);

  const writeTokenRevoke = useCallback(async () => {
    const amountToRevoke = BigInt(0);
    if (!contractAddress || !token || !walletClient || !address || !chainId || !publicClient) {
      return;
    }

    setIsRevoking(true);
    // setOpened(`Approve ${formatUnits(amountToRevoke, token.decimals)} ${token.symbol} tokens`)

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

      console.log("TRANSACTION METADATA TO SAVE");

      // console.log("ABI PART:", getAbiItem({ name: "approve", abi: ERC20_ABI }));
      // console.log("Args:", [contractAddress!, amountToRevoke!]);
      // console.log("Label info:", { symbol: token.symbol });
      // console.log("functionName", "approve");

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
        // addTransaction({
        //   account: address,
        //   hash,
        //   chainId,
        //   title: `Approve ${formatUnits(amountToRevoke, token.decimals)} ${token.symbol} tokens`,
        // }, address);
        // setSubmitted(hash, chainId as any);

        await publicClient.waitForTransactionReceipt({ hash });
        setIsRevoking(false);
      }
    } catch (e) {
      console.log(e);
      // setClose();
      setIsRevoking(false);
      addToast("Unexpected error, please contact support", "error");
    }
  }, [contractAddress, token, walletClient, address, chainId, publicClient, addRecentTransaction]);

  return {
    isAllowed,
    isApproving,
    isRevoking,
    writeTokenApprove,
    writeTokenRevoke,
    currentAllowance: currentAllowance.data,
  };
}
