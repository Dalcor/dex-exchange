import { PropsWithChildren } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Liquidity',
}
export default function Layout({children}: PropsWithChildren) {
  return <>{children}</>
}
