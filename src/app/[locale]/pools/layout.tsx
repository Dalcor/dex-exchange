import { Metadata } from "next";
import { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: "Liquidity",
};
export default function Layout({ children }: PropsWithChildren) {
  return <>{children}</>;
}
