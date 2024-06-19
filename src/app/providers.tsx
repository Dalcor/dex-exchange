"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useState } from "react";
import { type State, WagmiProvider } from "wagmi";

import { config } from "@/config/wagmi/config";

export default function Providers({
  initialState,
  children,
}: PropsWithChildren<{ initialState: State | undefined }>) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
