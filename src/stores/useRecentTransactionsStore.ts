import { Address, getAbiItem } from "viem";

export enum RecentTransactionStatus {
  PENDING,
  SUCCESS,
  ERROR,
  QUEUED,
}

export enum GasFeeModel {
  EIP1559,
  LEGACY,
}

export enum RecentTransactionTitleTemplate {
  APPROVE,
  DEPOSIT,
  SWAP,
  ADD,
  REMOVE,
  COLLECT,
  WITHDRAW,
}

type CommonRecentTransaction = {
  hash: Address;
  chainId: number;
  status: RecentTransactionStatus;
  nonce: number;
  gasFeeModel: GasFeeModel;
};

type RecentTransactionGasLimit =
  | {
      model: GasFeeModel.EIP1559;
      maxFeePerGas: number | undefined;
      maxPriorityFeePerGas: number | undefined;
    }
  | {
      model: GasFeeModel.LEGACY;
      gasPrice: bigint;
    };

type SingleTokenTransactionTitle = {
  symbol: string;
  amount: string;
  logoURI: string;
};

type TwoTokensTransactionTitle = {
  symbol0: string;
  symbol1: string;
  amount0: string;
  amount1: string;
  logoURI0: string;
  logoURI1: string;
};

type IncreaseLiquidityParams = any;

type SwapParams = any;

type RemoveLiquidityParams = any;

type ApproveTokenParams = any;

export type IRecentTransactionTitle =
  | ({
      template: RecentTransactionTitleTemplate.APPROVE;
    } & SingleTokenTransactionTitle)
  | ({
      template: RecentTransactionTitleTemplate.DEPOSIT;
    } & SingleTokenTransactionTitle)
  | ({
      template: RecentTransactionTitleTemplate.WITHDRAW;
    } & SingleTokenTransactionTitle)
  | ({
      template: RecentTransactionTitleTemplate.SWAP;
    } & TwoTokensTransactionTitle)
  | ({
      template: RecentTransactionTitleTemplate.COLLECT;
    } & TwoTokensTransactionTitle)
  | ({
      template: RecentTransactionTitleTemplate.REMOVE;
    } & TwoTokensTransactionTitle)
  | ({
      template: RecentTransactionTitleTemplate.ADD;
    } & TwoTokensTransactionTitle);

export type IRecentTransaction = {
  id: Address;
  status: RecentTransactionStatus;
  hash: Address;
  nonce: number;
  chainId: number;
  gas: { gas: bigint } & RecentTransactionGasLimit;
  params: IncreaseLiquidityParams | SwapParams | RemoveLiquidityParams | ApproveTokenParams;
  title: IRecentTransactionTitle;
};
// | SwapRecentTransaction
// | RemoveLiquidityRecentTransaction
// | ApproveTokenRecentTransaction;

import { create } from "zustand";

import { ERC20_ABI } from "@/config/abis/erc20";

interface ManageTokensDialogStore {
  transactions: {
    [key: string]: IRecentTransaction[];
  };
  addRecentTransaction: (
    transaction: Omit<IRecentTransaction, "status" | "id">,
    accountAddress: Address,
  ) => void;
  updateTransactionStatus: (id: string, status: RecentTransactionStatus, account: string) => void;
  updateTransactionHash: (id: string, newHash: `0x${string}`, account: string) => void;
  clearTransactions: () => void;
}

export const useRecentTransactionsStore = create<ManageTokensDialogStore>((set, get) => ({
  transactions: {},
  addRecentTransaction: (transaction, accountAddress) =>
    set((state) => {
      const pendingTransactions = state.transactions[accountAddress]?.find(
        (t) => t.status === RecentTransactionStatus.PENDING,
      );
      const updatedTransactions = { ...state.transactions };

      const currentAccountTransactions = updatedTransactions[accountAddress];

      if (!currentAccountTransactions) {
        updatedTransactions[accountAddress] = [];
      }

      // use initial transaction hash as unique ID. Hash field
      // could be rewrited with speed up or cancel functionality,
      // so we need one more field to avoid losing transaction reference
      const uid = transaction.hash;

      if (!pendingTransactions) {
        updatedTransactions[accountAddress] = [
          {
            ...transaction,
            status: RecentTransactionStatus.PENDING,
            id: uid,
          },
          ...updatedTransactions[accountAddress],
        ];
        return { transactions: updatedTransactions, isViewed: false };
      } else {
        updatedTransactions[accountAddress] = [
          {
            ...transaction,
            status: RecentTransactionStatus.QUEUED,
            id: uid,
          },
          ...updatedTransactions[accountAddress],
        ];
        return { transactions: updatedTransactions, isViewed: false };
      }
    }),
  updateTransactionStatus: (id, status, account) =>
    set((state) => {
      const transactionIndex = state.transactions[account].findIndex((_transaction) => {
        return _transaction.id === id;
      });

      if (transactionIndex !== -1) {
        const updatedTransactions = { ...state.transactions };
        const queuedTransactions = state.transactions[account].filter((t) => {
          return t.status === RecentTransactionStatus.QUEUED;
        });

        if (queuedTransactions.length) {
          const nextQueuedTransaction = queuedTransactions.reduce((prev, curr) => {
            return prev.nonce < curr.nonce ? prev : curr;
          });
          const nextQueuedTransactionIndex = updatedTransactions[account].findIndex(
            (t) => t.hash === nextQueuedTransaction.hash,
          );

          updatedTransactions[account][nextQueuedTransactionIndex] = {
            ...state.transactions[account][nextQueuedTransactionIndex],
            status: RecentTransactionStatus.PENDING,
          };
        }

        updatedTransactions[account][transactionIndex] = {
          ...state.transactions[account][transactionIndex],
          status,
        };

        return { transactions: updatedTransactions };
      }

      return {};
    }),
  updateTransactionHash: (id, newHash, account) =>
    set((state) => {
      const transactionIndex = state.transactions[account].findIndex((_transaction) => {
        return _transaction.id === id;
      });

      if (transactionIndex !== -1) {
        const updatedTransactions = { ...state.transactions };

        updatedTransactions[account][transactionIndex] = {
          ...state.transactions[account][transactionIndex],
          hash: newHash,
        };

        return { transactions: updatedTransactions };
      }

      return {};
    }),
  clearTransactions: () =>
    set(() => {
      return { transactions: {} };
    }),
}));
