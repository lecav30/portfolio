import { LanguageProvider } from "@components/languageProvider";
import "./globals.css";
import { ThemeProvider } from "@components/themeProvider";
import { Source_Code_Pro } from "next/font/google";
import type { Metadata } from "next";

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
});

const SITE_URL = "https://portfolio-sebastianlevano.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Sebastian Lévano – Desarrollador Web y Móvil",
  description:
    "Portafolio de Sebastian Lévano, desarrollador web y móvil especializado en React, Next.js y aplicaciones modernas.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  verification: { google: "tnTqQIfTuXY-x5jm4GDFbl2Bv2Lktl-A0qwPO30Fru0" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Portafolio de Sebastian Lévano",
    locale: "es_PE",
    title: "Sebastian Lévano – Desarrollador Web y Móvil",
    description:
      "Portafolio de Sebastian Lévano, desarrollador web y móvil especializado en React, Next.js y aplicaciones modernas.",
  },
  icons: { icon: "/favicon.ico" },
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <html
        lang="en"
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
          <LanguageProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
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
