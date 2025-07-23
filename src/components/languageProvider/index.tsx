"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";

import enMessages from "../../../messages/en.json";
import esMessages from "../../../messages/es.json";

const messagesMap = {
  en: enMessages,
  es: esMessages,
};

type LanguageContextType = {
  locale: string;
  setLocale: React.Dispatch<React.SetStateAction<Locale>>;
};

type Locale = keyof typeof messagesMap; // "en" | "es"

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>("en");

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider
        key={locale}
        locale={locale}
        messages={messagesMap[locale]}
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
