import { ReactNode } from "react";
import { i18n, Locale } from '@/i18n-config';
import { Golos_Text } from 'next/font/google'
import Header from "@/components/Header";
import { getDictionary } from "@/get-dictionary";
import LocaleProvider from "@/providers/LocaleProvider";
import WagmiProvider from "@/app/[locale]/Providers";
import './globals.css';

const golos_text = Golos_Text({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false
});

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export default async function RootLayout({
                                     children,
                                     params,
                                   }: {
  children: ReactNode
  params: { locale: Locale }
}) {
  const dictionary = await getDictionary(params.locale);

  return (
    <html lang={params.locale}>
      <body className={golos_text.className}>
        <WagmiProvider>
          <LocaleProvider dictionary={dictionary}>
            <Header />
            {children}
          </LocaleProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}

export const metadata = {
  title: 'i18n within app directory - Vercel Examples',
  description: 'How to do i18n in Next.js 13 within app directory',
}
