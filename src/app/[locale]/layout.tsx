import { PropsWithChildren } from "react";
import { Golos_Text } from 'next/font/google'
import Header from "@/components/others/Header";
import { Providers } from "@/app/[locale]/providers";
import '../../assets/styles/globals.css';
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import Footer from "@/components/others/Footer";
import clsx from "clsx";
import { cookieToInitialState } from "wagmi";
import { config } from "@/config/wagmi/config";
import { headers } from "next/headers";

const golos_text = Golos_Text({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false
});

interface Props {
  params: {
    locale: "es" | "en" | "zh"
  }
}

export default async function RootLayout({
                                           children,
                                           params: { locale }
                                         }: PropsWithChildren<Props>) {

  let messages;
  const initialState = cookieToInitialState(
    config,
    headers().get('cookie')
  )

  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale}>
    <body className={clsx(golos_text.className)}>
    <Providers initialState={initialState} messages={messages} locale={locale}>
      <NextIntlClientProvider messages={messages}>
        <div className="grid h-[100vh] grid-rows-layout">
          <Header/>
          <div>
            {children}
          </div>
          <Footer />
        </div>
      </NextIntlClientProvider>
    </Providers>
    </body>
    </html>
  )
}

export const metadata = {
  title: 'Dex Exchange',
  description: 'How to do i18n in Next.js 13 within app directory',
}
