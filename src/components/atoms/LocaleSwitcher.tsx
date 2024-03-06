"use client";

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
  };
} = {
  en: {
    img: "/locales/en.svg",
    label: "English",
  },
  es: {
    img: "/locales/es.svg",
    label: "Español",
  },
  zh: {
    img: "/locales/zh.svg",
    label: "中国人",
  },
};
export default function LocaleSwitcher() {
  const lang = useLocale();
  const pathName = usePathname();
  const router = useRouter();

  const [isOpened, setIsOpened] = useState(false);

  const redirectedPathName = (locale: string) => {
    router.replace(pathName, { locale });
  };

  return (
    <div>
      <Popover
        isOpened={isOpened}
        setIsOpened={setIsOpened}
        placement={"bottom-start"}
        trigger={
          <SelectButton isOpen={isOpened} onClick={() => setIsOpened(!isOpened)} withArrow={false}>
            <Image
              src={localesMap[lang]?.img || localesMap["en"]?.img}
              alt={localesMap[lang]?.label}
              width={24}
              height={24}
            />
          </SelectButton>
        }
      >
        <div className="py-1 bg-primary-bg rounded-2 border border-primary-border">
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
                    {localesMap[locale]?.label}
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
