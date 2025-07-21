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
        <head />
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
