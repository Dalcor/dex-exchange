"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { ReactNode, useEffect, useState } from "react";
import { type State, WagmiProvider } from "wagmi";

import Logo from "@/components/atoms/Logo";
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

const timeZone = "Europe/Vienna";

export function Providers({ children, initialState, messages, locale }: Props) {
  const [queryClient] = useState(() => new QueryClient());
  const [loaded, setIsLoaded] = useState(false);
  const [mountPreloader, setMountPreloader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50); // Small delay to ensure initial render completes
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loaded) {
      const timer = setTimeout(() => {
        setMountPreloader(false);
      }, 650);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  return (
    <>
      {mountPreloader && (
        <div
          style={{ transitionDuration: "500ms" }}
          className={clsxMerge(
            " fixed w-full h-full top-0 left-0 flex items-center justify-center bg-global-bg z-[999]",
            loaded ? "opacity-0 pointer-events-none" : "opacity-100",
          )}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-[calc(50%-9px)] md:-translate-x-[calc(50%-24px)] -translate-y-1/2 z-10">
            <div className="w-[90px] h-[102px] md:w-[172px] md:h-[195px]">
              <Logo />
            </div>
          </div>
          <div className="main-loader" />
        </div>
      )}
      <DatabaseProvider>
        <WagmiProvider reconnectOnMount={true} config={config} initialState={initialState}>
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
