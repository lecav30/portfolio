import { LanguageProvider } from "@components/languageProvider";
import "./globals.css";
import { ThemeProvider } from "@components/themeProvider";
import { Source_Code_Pro } from "next/font/google";
import "katex/dist/katex.min.css";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { resolvePublicLocale } from "@/i18n/publicLocale";

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
});

const SITE_URL = "https://www.sebastianlevano.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Sebastian Lévano - Web & Mobile Developer",
  description:
    "Portfolio of Sebastian Lévano, a web and mobile developer specializing in React, Next.js, and modern applications.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  verification: { google: "tnTqQIfTuXY-x5jm4GDFbl2Bv2Lktl-A0qwPO30Fru0" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Sebastian Lévano Portfolio",
    locale: "en_US",
    title: "Sebastian Lévano - Web & Mobile Developer",
    description:
      "Portfolio of Sebastian Lévano, a web and mobile developer specializing in React, Next.js, and modern applications.",
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport = {
  themeColor: "#0f172a",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = resolvePublicLocale(cookieStore.get("locale")?.value);
  const savedTheme = cookieStore.get("theme")?.value;
  const defaultTheme = ["light", "dark", "system"].includes(savedTheme ?? "")
    ? savedTheme
    : "system";

  return (
    <>
      <html
        lang={locale}
        suppressHydrationWarning
        className={`${sourceCodePro.className} scroll-smooth`}
      >
        <head>
          <meta
            name="google-site-verification"
            content="tnTqQIfTuXY-x5jm4GDFbl2Bv2Lktl-A0qwPO30Fru0"
          />
        </head>
        <body className="dark:bg-dark">
          <LanguageProvider initialLocale={locale} persistLocale={false}>
            <ThemeProvider
              attribute="class"
              defaultTheme={defaultTheme}
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </LanguageProvider>
        </body>
      </html>
    </>
  );
}
