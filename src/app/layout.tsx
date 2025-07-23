import { LanguageProvider } from "@/components/languageProvider";
import "./globals.css";
import { ThemeProvider } from "@components/themeProvider";
import { Source_Code_Pro } from "next/font/google";

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
});

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
