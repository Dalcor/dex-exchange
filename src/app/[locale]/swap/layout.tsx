import { PropsWithChildren } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Swap',
}
export default function Layout({children}: PropsWithChildren) {
  return <>{children}</>
}
