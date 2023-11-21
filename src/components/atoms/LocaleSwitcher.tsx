'use client'

import { usePathname, useRouter } from 'next/navigation'
import { i18n, Locale } from '@/i18n-config';
import Popover from "@/components/atoms/Popover";
import { useMemo, useState } from "react";
import Image from "next/image";
import SelectOption from "@/components/atoms/SelectOption";

const localesMap = {
  en: {
    img: "/locales/en.svg",
    label: "English"
  },
  es: {
    img: "/locales/es.svg",
    label: "Español"
  },
  zh: {
    img: "/locales/zh.svg",
    label: "中国人"
  }
}
export default function LocaleSwitcher() {
  const pathName = usePathname();
  const router = useRouter();

  const currentLocale = useMemo(() => {
    const segments = pathName.split('/');

    return segments[1] as Locale;
  }, [pathName]);
  const redirectedPathName = (locale: string) => {
    if (!pathName) return '/'
    const segments = pathName.split('/')
    segments[1] = locale
    return segments.join('/')
  }

  const [isOpened, setIsOpened] = useState(false);

  return (
    <div>
      <Popover withArrow={false} isOpened={isOpened} setIsOpened={setIsOpened} buttonContent={
        <Image src={localesMap[currentLocale]?.img || localesMap["en"]?.img} alt={localesMap[currentLocale]?.label} width={24} height={24} />
      } placement={"bottom-start"}>
        <div className="py-1 bg-block-fill rounded-2 border border-primary-border">
          <ul>
            {i18n.locales.map((locale) => {
              return (
                <li className="min-w-[200px] hover:bg-table-fill cursor-pointer" key={locale}>
                  <SelectOption onClick={() => router.push(redirectedPathName(locale))} isActive={currentLocale === locale}>
                    <Image src={localesMap[locale]?.img} alt={localesMap[locale]?.label} width={24} height={24} />
                    {localesMap[locale]?.label}
                  </SelectOption>
                </li>
              )
            })}
          </ul>
        </div>

      </Popover>

    </div>
  )
}
