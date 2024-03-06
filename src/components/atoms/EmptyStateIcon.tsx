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
  wallet: "/empty/empty-wallet.svg",
};

type EmptyIconName = keyof typeof emptyStateIconUrlMap;

export default function EmptyStateIcon({ iconName }: { iconName: EmptyIconName }) {
  return <Image width={80} height={80} src={emptyStateIconUrlMap[iconName]} alt="" />;
}
