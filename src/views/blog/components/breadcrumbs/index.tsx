import Link from "next/link";
import { useTranslations } from "next-intl";

type Breadcrumb = {
  href?: string;
  label: string;
};

export default function BlogBreadcrumbs({ items }: { items: Breadcrumb[] }) {
  const t = useTranslations("Blog");

  return (
    <nav aria-label={t("breadcrumbs")}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
        {items.map((item, index) => (
          <li className="flex items-center gap-x-2" key={`${item.href ?? "current"}-${item.label}`}>
            {index ? <span aria-hidden="true">/</span> : null}
            {item.href ? (
              <Link className="font-semibold text-main hover:underline" href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
