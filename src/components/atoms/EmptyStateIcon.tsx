import Image from "next/image";

const emptyStateIconUrlMap = {
  assets: "/empty/empty-assets.svg",
  edit: "/empty/empty-edit.svg",
  history: "/empty/empty-history.svg",
  imported: "/empty/empty-imported.svg",
  list: "/empty/empty-list.svg",
  pair: "/empty/empty-pair.svg",
  pool: "/empty/empty-pool.svg",
  search: "/empty/empty-search.svg",
  "search-list": "/empty/empty-search-list.svg",
  wallet: "/empty/empty-wallet.svg",
  custom: "/empty/empty-custom-tokens.svg",
  tokens: "/empty/empty-tokens.svg",
  warning: "/empty/empty-warning.svg",
  autolisting: "/empty/empty-autolisting.svg",
};

type EmptyIconName = keyof typeof emptyStateIconUrlMap;

export default function EmptyStateIcon({
  iconName,
  size = 80,
}: {
  iconName: EmptyIconName;
  size?: number;
}) {
  return <Image width={size} height={size} src={emptyStateIconUrlMap[iconName]} alt="" />;
}
