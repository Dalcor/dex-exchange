"use client";

import clsx from "clsx";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useState } from "react";

import Popover from "@/components/atoms/Popover";
import SelectButton from "@/components/atoms/SelectButton";
import SelectOption from "@/components/atoms/SelectOption";
import { locales, usePathname, useRouter } from "@/navigation";

const localesMap: {
  [key: string]: {
    img: string;
    label: string;
    symbol: string;
  };
} = {
  en: {
    img: "/locales/en.svg",
    label: "English",
    symbol: "En",
  },
  es: {
    img: "/locales/es.svg",
    label: "Español",
    symbol: "Es",
  },
  zh: {
    img: "/locales/zh.svg",
    label: "中国人",
    symbol: "Zh",
  },
};
export default function LocaleSwitcher({ isMobile = false }: { isMobile?: boolean }) {
  const lang = useLocale();
  const pathName = usePathname();
  const router = useRouter();

  const [isOpened, setIsOpened] = useState(false);

  const redirectedPathName = (locale: string) => {
    router.replace(pathName, { locale });
  };

  return (
    <div className={clsx(!isMobile && "hidden xl:block", "flex-shrink-0")}>
      <Popover
        isOpened={isOpened}
        setIsOpened={setIsOpened}
        placement={"bottom-start"}
        trigger={
          <SelectButton
            className="px-3"
            variant={isMobile ? "rectangle-secondary" : "rectangle-primary"}
            isOpen={isOpened}
            onClick={() => setIsOpened(!isOpened)}
          >
            {localesMap[lang]?.symbol || localesMap["en"]?.symbol}
          </SelectButton>
        }
      >
        <div className="py-1 bg-primary-bg rounded-2 shadow-popover">
          <ul>
            {locales.map((locale) => {
              return (
                <li className="min-w-[200px] hover:bg-tertiary-bg cursor-pointer" key={locale}>
                  <SelectOption
                    onClick={() => redirectedPathName(locale)}
                    isActive={lang === locale}
                  >
                    <Image
                      src={localesMap[locale]?.img}
                      alt={localesMap[locale]?.label}
                      width={24}
                      height={24}
                    />
                    {localesMap[locale]?.label} ({localesMap[locale]?.symbol})
                  </SelectOption>
                </li>
              );
            })}
          </ul>
        </div>
      </Popover>
    </div>
  );
}
