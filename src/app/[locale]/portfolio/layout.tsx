import { Metadata } from "next";
import { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: "Portfolio",
};
export default function Layout({ children }: PropsWithChildren) {
  return <>{children}</>;
}
