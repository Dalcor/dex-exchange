import { Address } from "viem";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

import { db } from "@/db/db";

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
      maxFeePerGas: string | undefined;
      maxPriorityFeePerGas: string | undefined;
    }
  | {
      model: GasFeeModel.LEGACY;
      gasPrice: string;
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
  gas: { gas: string } & RecentTransactionGasLimit;
  params: IncreaseLiquidityParams | SwapParams | RemoveLiquidityParams | ApproveTokenParams;
  title: IRecentTransactionTitle;
};

const localStorageKey = "d223_recent_transactions_v1";
interface RecentTransactions {
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

export function stringifyObject(object: { [key: string]: any }) {
  return JSON.parse(
    JSON.stringify(
      object,
      (key, value) => (typeof value === "bigint" ? value.toString() : value), // return everything else unchanged
    ),
  );
}

const storage: StateStorage = {
  getItem: async (key) => {
    const item = await db.recentTransactions.get({ key });
    return item ? JSON.stringify(item.value) : null;
  },
  setItem: async (key, value) => {
    await db.recentTransactions.put({ key, value: JSON.parse(value) });
  },
  removeItem: async (key) => {
    await db.recentTransactions.delete(key);
  },
};

export const useRecentTransactionsStore = create<RecentTransactions>()(
  persist(
    (set) => ({
      transactions: {},
      addRecentTransaction: (transaction, accountAddress) =>
        set((state) => {
          const updatedTransactions = { ...state.transactions };
          const accountTransactions = updatedTransactions[accountAddress] || [];
          const status = accountTransactions.some(
            (t) => t.status === RecentTransactionStatus.PENDING,
          )
            ? RecentTransactionStatus.QUEUED
            : RecentTransactionStatus.PENDING;

          const newTransaction = {
            ...transaction,
            status,
            id: transaction.hash,
          };

          updatedTransactions[accountAddress] = [newTransaction, ...accountTransactions];
          return { transactions: updatedTransactions, isViewed: false };
        }),
      updateTransactionStatus: (id, status, account) =>
        set((state) => {
          const updatedTransactions = { ...state.transactions };
          const accountTransactions = updatedTransactions[account];
          const transactionIndex = accountTransactions.findIndex((t) => t.id === id);

          if (transactionIndex === -1) return {};

          accountTransactions[transactionIndex].status = status;

          if (
            status === RecentTransactionStatus.SUCCESS ||
            status === RecentTransactionStatus.ERROR
          ) {
            const nextQueuedTransaction = accountTransactions.find(
              (t) => t.status === RecentTransactionStatus.QUEUED,
            );
            if (nextQueuedTransaction) {
              nextQueuedTransaction.status = RecentTransactionStatus.PENDING;
            }
          }

          return { transactions: updatedTransactions };
        }),
      updateTransactionHash: (id, newHash, account) =>
        set((state) => {
          const updatedTransactions = { ...state.transactions };
          const accountTransactions = updatedTransactions[account];
          const transaction = accountTransactions.find((t) => t.id === id);

          if (!transaction) return {};

          transaction.hash = newHash;
          return { transactions: updatedTransactions };
        }),
      clearTransactions: () =>
        set(() => {
          return { transactions: {} };
        }),
    }),
    {
      name: "transactions",
      storage: createJSONStorage(() => storage),
    },
  ),
);
