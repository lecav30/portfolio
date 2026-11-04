"use client";
import { Laptop, Menu } from "lucide-react";
import ThemeChanger from "../themeChanger";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import LanguageChanger from "../languageChanger";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const Header = ({ variant = "portfolio" }: { variant?: "blog" | "portfolio" }) => {
  const t = useTranslations("Header");

  const sections = ["hero", "services", "experience", "projects", "contact"];
  const [activeSection, setActiveSection] = useState(sections[0]);
  const [showMenu, setShowMenu] = useState(false);
  const { resolvedTheme } = useTheme();
  const headerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isPortfolioRoute = pathname === "/";

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) {
      router.push(`/#${sectionId}`);
      return;
    }

    const headerBottom = headerRef.current?.getBoundingClientRect().bottom ?? 0;
    window.scrollTo({
      top:
        section.getBoundingClientRect().top +
        window.scrollY -
        headerBottom -
        16,
      behavior: "smooth",
    });
    window.history.pushState(null, "", `#${sectionId}`);
    setActiveSection(sectionId);
    setShowMenu(false);
  };

  const handleSectionNavigation = (event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    if (!isPortfolioRoute) {
      setShowMenu(false);
      return;
    }

    event.preventDefault();
    scrollToSection(sectionId);
  };

  useEffect(() => {
    if (variant === "blog" || !isPortfolioRoute) return;

    const handleScroll = () => {
      const sections = document.querySelectorAll("section");
      const scrollPosition = window.scrollY + 100;
      sections.forEach((section) => {
        if (
          scrollPosition >= section.offsetTop &&
          scrollPosition < section.offsetTop + section.offsetHeight
        ) {
          setActiveSection(section.id);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isPortfolioRoute, showMenu, variant]);

  if (variant === "blog") {
    return (
      <div
        ref={headerRef}
        className="fixed top-0 right-0 left-0 z-50 mx-auto flex h-16 max-w-5xl items-center justify-between px-4 backdrop-blur-md sm:px-8"
      >
        <Link aria-label="Sebastian Lévano" href="/">
          <Laptop />
        </Link>
        <nav aria-label={t("primaryNavigation")}>
          <ul className="flex items-center gap-4 text-sm font-semibold sm:gap-6">
            <li>
              <Link className="hover:text-main" href="/">
                {t("home")}
              </Link>
            </li>
            <li>
              <Link aria-current="page" className="border-b-[0.2rem] border-main" href="/blog">
                {t("blog")}
              </Link>
            </li>
            <li className="flex gap-3">
              <ThemeChanger />
              <LanguageChanger />
            </li>
          </ul>
        </nav>
      </div>
    );
  }

  return (
    <div
      ref={headerRef}
      className={`flex justify-between items-center max-w-[65rem] mx-auto fixed top-0 left-0
        right-0 h-20 px-8 z-50 md:rounded-2xl md:mt-2 md:shadow-lg ${!showMenu && "backdrop-blur-md"}
        ${showMenu && resolvedTheme === "dark" && "bg-dark"}
        ${showMenu && resolvedTheme === "light" && "bg-white"}`}
    >
      <div className="flex gap-4 items-center">
        <Link href="/" onClick={() => setShowMenu(false)}>
          <Laptop />
        </Link>
      </div>
      <button aria-label={showMenu ? t("closeNavigation") : t("openNavigation")} className="cursor-pointer lg:hidden" onClick={() => setShowMenu(!showMenu)} type="button">
        <Menu />
      </button>
      <nav
        id="navbar"
        className={`navbar absolute top-20 left-0 w-screen overflow-hidden
        lg:bg-inherit lg:static lg:w-auto lg:h-auto lg:overflow-visible lg:opacity-100
        ${showMenu && "h-screen opacity-100 transition-all duration-300 ease-in-out"}
        ${!showMenu && "h-0 opacity-0 transition-all duration-300 ease-in-out"}
        ${showMenu && resolvedTheme === "dark" && "bg-dark"}
        ${showMenu && resolvedTheme === "light" && "bg-white"}`}
      >
        <ul
          className="flex flex-col items-center gap-10 font-semibold scroll-smooth lg:flex-row lg:gap-10 lg:opacity-100 xl:gap-16"
        >
          <li>
            <a
              className={`mb-5 md:mb-0 hover:border-main hover:border-b-[0.2rem]
              ${isPortfolioRoute && activeSection === "hero" && "border-main border-b-[0.2rem]"}
              transition-all duration-200 ease-in-out`}
              href={pathname === "/" ? "#hero" : "/#hero"}
              onClick={(event) => handleSectionNavigation(event, sections[0])}
            >
              {t("home")}
            </a>
          </li>
          <li>
            <a
              className={`mb-5 md:mb-0 hover:border-main hover:border-b-[0.2rem]
              ${isPortfolioRoute && activeSection === "services" && "border-main border-b-[0.2rem]"}
              transition-all duration-200 ease-in-out`}
              href={pathname === "/" ? "#services" : "/#services"}
              onClick={(event) => handleSectionNavigation(event, sections[1])}
            >
              {t("services")}
            </a>
          </li>
          <li>
            <a
              className={`mb-5 md:mb-0 hover:border-main hover:border-b-[0.2rem]
              ${isPortfolioRoute && activeSection === "experience" && "border-main border-b-[0.2rem]"}
              transition-all duration-200 ease-in-out`}
              href={pathname === "/" ? "#experience" : "/#experience"}
              onClick={(event) => handleSectionNavigation(event, sections[2])}
            >
              {t("experience")}
            </a>
          </li>
          <li>
            <a
              className={`mb-5 md:mb-0 hover:border-main hover:border-b-[0.2rem]
              ${isPortfolioRoute && activeSection === "projects" && "border-main border-b-[0.2rem]"}
              transition-all duration-200 ease-in-out`}
              href={pathname === "/" ? "#projects" : "/#projects"}
              onClick={(event) => handleSectionNavigation(event, sections[3])}
            >
              {t("projects")}
            </a>
          </li>
          <li>
            <a
              className={`mb-5 md:mb-0 hover:border-main hover:border-b-[0.2rem]
              ${isPortfolioRoute && activeSection === "contact" && "border-main border-b-[0.2rem]"}
              transition-all duration-200 ease-in-out`}
              href={pathname === "/" ? "#contact" : "/#contact"}
              onClick={(event) => handleSectionNavigation(event, sections[4])}
            >
              {t("contact")}
            </a>
          </li>
          <li>
            <Link
              className={`mb-5 md:mb-0 hover:border-main hover:border-b-[0.2rem]
              ${pathname.startsWith("/blog") && "border-main border-b-[0.2rem]"}
              transition-all duration-200 ease-in-out`}
              href="/blog"
              onClick={() => setShowMenu(false)}
            >
              {t("blog")}
            </Link>
          </li>
          <li>
            <div className="flex gap-4">
              <ThemeChanger />
              <LanguageChanger />
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Header;
