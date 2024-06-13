import "../../assets/styles/globals.css";

import clsx from "clsx";
import { Golos_Text, Space_Mono } from "next/font/google";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PropsWithChildren } from "react";
import { cookieToInitialState } from "wagmi";

import { Providers } from "@/app/[locale]/providers";
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import { config } from "@/config/wagmi/config";

const golos_text = Golos_Text({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

interface Props {
  params: {
    locale: "es" | "en" | "zh";
  };
}

export default async function RootLayout({
  children,
  params: { locale },
}: PropsWithChildren<Props>) {
  let messages;
  const initialState = cookieToInitialState(config, headers().get("cookie"));

  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html suppressHydrationWarning lang={locale}>
      <body className={clsx(golos_text.className)}>
        <Providers initialState={initialState} messages={messages} locale={locale}>
          <div className="grid h-[100vh] grid-rows-layout">
            <Header />
            <div>{children}</div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

export const metadata = {
  title: "Dex Exchange",
  description: "How to do i18n in Next.js 13 within app directory",
};
