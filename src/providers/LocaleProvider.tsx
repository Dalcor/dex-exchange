"use client";
import { createContext, PropsWithChildren, useContext, useMemo } from "react";

interface LocaleContextInterface {
  t: (ns: string, key: string) => string
}

const LocaleContext = createContext<LocaleContextInterface>({
  t: (ns: string, key: string) => ""
});

export default function LocaleProvider({ children, dictionary }: PropsWithChildren<{ dictionary: { [ns: string]: { [key: string]: string } } }>) {
  function getLocalizedStringByKey(ns: string, key: string) {
    return dictionary[ns][key]
  }

  return <LocaleContext.Provider value={{
    t: getLocalizedStringByKey
  }}>
    {children}
  </LocaleContext.Provider>
}

export const useTranslation = () => {
  return useContext(LocaleContext);
};
