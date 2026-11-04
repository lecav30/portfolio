import { getRequestConfig } from "next-intl/server";
import { resolvePublicLocale } from "./publicLocale";

export default getRequestConfig(async () => {
  const locale = resolvePublicLocale();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
