import { ReactNode } from "react";
import { i18n, Locale } from '@/i18n-config';
import Header from "@/components/Header";
import './globals.css';
import { getDictionary } from "@/get-dictionary";
import Providers from "@/app/[locale]/Providers";
import LocaleProvider from "@/providers/LocaleProvider";

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
      <body>
        <Providers>
          <LocaleProvider dictionary={dictionary}>
            <Header />
            {children}
          </LocaleProvider>
        </Providers>
      </body>
    </html>
  )
}

export const metadata = {
  title: 'i18n within app directory - Vercel Examples',
  description: 'How to do i18n in Next.js 13 within app directory',
}
