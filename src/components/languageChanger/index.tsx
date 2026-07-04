import { useLanguage } from "../languageProvider";

const LanguageChanger = () => {
  const { locale, setLocale } = useLanguage();

  const toggleLanguage = () => {
    setLocale(locale === "en" ? "es" : "en");
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="relative"
      aria-label={locale === "en" ? "Cambiar a español" : "Switch to English"}
    >
      {locale === "en" ? "ES" : "EN"}
    </button>
  );
};

export default LanguageChanger;
