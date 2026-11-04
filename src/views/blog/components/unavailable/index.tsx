import { useTranslations } from "next-intl";

export default function BlogUnavailable() {
  const t = useTranslations("Blog");

  return (
    <section aria-live="polite" className="mx-auto max-w-3xl rounded-2xl border border-amber-300 bg-amber-50 p-8 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
      <h1 className="text-2xl font-bold">{t("unavailableTitle")}</h1>
      <p className="mt-3 leading-7">{t("unavailableDescription")}</p>
    </section>
  );
}
