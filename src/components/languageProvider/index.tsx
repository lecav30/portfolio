"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { NextIntlClientProvider } from "next-intl";

import enMessages from "../../../messages/en.json";
import esMessages from "../../../messages/es.json";

const messagesMap = {
  en: enMessages,
  es: esMessages,
};

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

type Locale = keyof typeof messagesMap; // "en" | "es"

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) => {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.cookie = `locale=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider
        key={locale}
        locale={locale}
        messages={messagesMap[locale]}
        timeZone="America/Lima"
      >
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
