import { PropsWithChildren } from "react";
import { Golos_Text } from 'next/font/google'
import Header from "@/components/Header";
import WagmiProvider from "@/app/[locale]/Providers";
import './globals.css';
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";

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
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  console.log(messages);
  return (
    <html lang={locale}>
    <body className={golos_text.className}>
    <WagmiProvider>
      <NextIntlClientProvider messages={messages}>
        <Header/>
        {children}
      </NextIntlClientProvider>
    </WagmiProvider>
    </body>
    </html>
  )
}

export const metadata = {
  title: 'Dex Exchange',
  description: 'How to do i18n in Next.js 13 within app directory',
}
