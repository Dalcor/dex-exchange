import { DexChainId } from "@/sdk_hybrid/chains";

export enum ExplorerLinkType {
  ADDRESS,
  TRANSACTION,
  BLOCK,
  GAS_TRACKER,
}

const explorerMap: Record<DexChainId, string> = {
  [DexChainId.SEPOLIA]: "https://sepolia.etherscan.io",
  // [DexChainId.CALLISTO]: "https://explorer.callisto.network",
  [DexChainId.BSC_TESTNET]: "https://testnet.bscscan.com",
};
export default function getExplorerLink(
  type: ExplorerLinkType,
  value: string,
  chainId: DexChainId,
) {
  switch (type) {
    case ExplorerLinkType.ADDRESS:
      return `${explorerMap[chainId]}/address/${value}`;
    case ExplorerLinkType.TRANSACTION:
      return `${explorerMap[chainId]}/tx/${value}`;
    case ExplorerLinkType.BLOCK:
      return `${explorerMap[chainId]}/block/${value}`;
    case ExplorerLinkType.GAS_TRACKER:
      return `${explorerMap[chainId]}/gastracker`;
    default:
      return `${explorerMap[chainId]}`;
  }
}
