import { useLanguage } from "../languageProvider";

const ThemeChanger = () => {
  const { locale, setLocale } = useLanguage();

  const toggleLanguage = () => {
    setLocale(locale === "en" ? "es" : "en");
  };

  return (
    <button onClick={() => toggleLanguage()} className="relative">
      {locale === "en" ? "Español" : "English"}
    </button>
  );
};

export default ThemeChanger;
