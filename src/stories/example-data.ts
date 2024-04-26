import { DexChainId } from "@/sdk_hybrid/chains";
import { Token } from "@/sdk_hybrid/entities/token";
import {
  GasFeeModel,
  IRecentTransactionTitle,
  RecentTransactionStatus,
  RecentTransactionTitleTemplate,
} from "@/stores/useRecentTransactionsStore";

export const exampleToken: Token = new Token(
  DexChainId.SEPOLIA,
  "0x40769999A285730B1541DD501406168309DDa65c",
  "0x40769999A285730B1541DD501406168309DDa65c",
  18,
  "USDT",
  "Tether USD",
  "/example.svg",
);

export const exampleToken1: Token = new Token(
  DexChainId.SEPOLIA,
  "0x40769999A285730B1541DD501406168309DDa65c",
  "0x40769999A285730B1541DD501406168309DDa65c",
  18,
  "DAI",
  "DAI Token",
  "/example.svg",
);

export const exampleTitleForOne: IRecentTransactionTitle = {
  template: RecentTransactionTitleTemplate.APPROVE,
  amount: "1",
  logoURI: "/example.svg",
  symbol: "USDT",
};

export const exampleTitleForTwo: IRecentTransactionTitle = {
  template: RecentTransactionTitleTemplate.SWAP,
  amount0: "1",
  amount1: "2",
  logoURI0: "/example.svg",
  logoURI1: "/example.svg",
  symbol0: "USDT",
  symbol1: "DAI",
};

export const exampleTransaction = {
  chainId: 1,
  gas: {
    gas: "1000000",
    model: GasFeeModel.EIP1559,
    maxFeePerGas: "11000",
    maxPriorityFeePerGas: "1",
  },
  title: exampleTitleForOne,
  id: "0x00000000000000000000000000",
  status: RecentTransactionStatus.SUCCESS,
  hash: "0x00000000000000000000000000",
  nonce: 0,
  params: undefined,
} as const;
