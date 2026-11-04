import Footer from "@components/footer";
import Header from "@components/header";
import type { ReactNode } from "react";

export default function BlogShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header>
        <Header variant="blog" />
      </header>
      <main className="mx-auto mt-24 w-[95%] max-w-5xl pb-16">{children}</main>
      <footer className="mx-auto w-[95%] max-w-5xl">
        <Footer />
      </footer>
    </>
  );
}
