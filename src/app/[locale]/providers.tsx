"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { ReactNode, useEffect, useState } from "react";
import { type State, WagmiProvider } from "wagmi";

import Preloader from "@/components/atoms/Preloader";
import { config } from "@/config/wagmi/config";
import { clsxMerge } from "@/functions/clsxMerge";
import { Locale } from "@/navigation";
import DatabaseProvider from "@/providers/DatabaseProvider";
import DialogsProvider from "@/providers/DialogsProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import ToastProvider from "@/providers/ToastProvider";

type Props = {
  children: ReactNode;
  initialState: State | undefined;
  messages: AbstractIntlMessages | undefined;
  locale: Locale;
};

const queryClient = new QueryClient();
const timeZone = "Europe/Vienna";

export function Providers({ children, initialState, messages, locale }: Props) {
  const [loaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50); // Small delay to ensure initial render completes
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div
        style={{ transitionDuration: "500ms" }}
        className={clsxMerge(
          " fixed w-full h-full top-0 left-0 flex items-center justify-center bg-primary-bg z-[999]",
          loaded ? "opacity-0 pointer-events-none" : "opacity-100",
        )}
      >
        <Preloader size={100} />
      </div>
      <DatabaseProvider>
        <WagmiProvider config={config} initialState={initialState}>
          <QueryClientProvider client={queryClient}>
            <NextIntlClientProvider locale={locale} timeZone={timeZone} messages={messages}>
              <ThemeProvider attribute="class">
                <ToastProvider>
                  <DialogsProvider>{children}</DialogsProvider>
                </ToastProvider>
              </ThemeProvider>
            </NextIntlClientProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </DatabaseProvider>
    </>
  );
}
