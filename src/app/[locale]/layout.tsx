import clsx from "clsx";
import { Golos_Text } from "next/font/google";
import { notFound } from "next/navigation";
import { PropsWithChildren } from "react";

import { Providers } from "@/app/[locale]/providers";
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";

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

  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    console.log(error);
    notFound();
  }

  return (
    <html suppressHydrationWarning lang={locale}>
      <body className={clsx(golos_text.className)}>
        <Providers messages={messages} locale={locale}>
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
