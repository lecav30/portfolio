import BlogShell from "@views/blog/components/shell";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function BlogNotFound() {
  const t = await getTranslations("Blog");

  return (
    <BlogShell>
      <section className="mx-auto max-w-3xl space-y-5 rounded-2xl border border-slate-200 p-8 dark:border-slate-800">
        <p className="font-semibold uppercase tracking-[0.2em] text-main">404</p>
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">{t("notFoundTitle")}</h1>
        <p className="leading-7 text-slate-700 dark:text-slate-200">{t("notFoundDescription")}</p>
        <Link className="inline-flex font-semibold text-main hover:underline" href="/blog">
          {t("backToBlog")}
        </Link>
      </section>
    </BlogShell>
  );
}
