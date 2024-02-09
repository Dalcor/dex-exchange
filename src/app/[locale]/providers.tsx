"use client";

import { config } from "@/config/wagmi/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type State, WagmiProvider } from "wagmi";
import { ReactNode } from "react";
import ToastProvider from "@/providers/ToastProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { Locale } from "@/navigation";

type Props = {
  children: ReactNode,
  initialState: State | undefined,
  messages: AbstractIntlMessages | undefined,
  locale: Locale
}

const queryClient = new QueryClient()
const timeZone = 'Europe/Vienna';

export function Providers({ children, initialState, messages, locale }: Props) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale={locale} timeZone={timeZone} messages={messages}>
          <ThemeProvider attribute="class">
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
