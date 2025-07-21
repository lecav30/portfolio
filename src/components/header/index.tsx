"use client";
import { Laptop, Menu } from "lucide-react";
import ThemeChanger from "../themeChanger";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import LanguageChanger from "../languageChanger";
import { useTranslations } from "next-intl";

const Header = () => {
  const t = useTranslations("Header");

  const sections = ["hero", "services", "experience", "projects", "contact"];
  const [activeSection, setActiveSection] = useState(sections[0]);
  const [showMenu, setShowMenu] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
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
  }, [showMenu]);

  return (
    <div
      className={`flex justify-between items-center max-w-[65rem] mx-auto fixed top-0 left-0
        right-0 h-20 px-8 z-50 md:rounded-2xl md:mt-2 md:shadow-lg ${!showMenu && "backdrop-blur-md"}
        ${showMenu && resolvedTheme === "dark" && "bg-dark"}
        ${showMenu && resolvedTheme === "light" && "bg-white"}`}
    >
      <div className="flex gap-4 items-center">
        <a
          href="#hero"
          onClick={() => {
            setActiveSection(sections[0]);
            setShowMenu(false);
          }}
        >
          <Laptop />
        </a>
      </div>
      <Menu
        className={`cursor-pointer md:hidden`}
        onClick={() => setShowMenu(!showMenu)}
      />
      <nav
        id="navbar"
        className={`navbar absolute top-20 left-0 w-screen overflow-hidden
        md:bg-inherit md:static md:w-auto md:h-auto md:overflow-visible md:opacity-100
        ${showMenu && "h-screen opacity-100 transition-all duration-300 ease-in-out"}
        ${!showMenu && "h-0 opacity-0 transition-all duration-300 ease-in-out"}
        ${showMenu && resolvedTheme === "dark" && "bg-dark"}
        ${showMenu && resolvedTheme === "light" && "bg-white"}`}
      >
        <ul
          className="flex flex-col items-center md:opacity-100 md:flex-row gap-16
          font-semibold scroll-smooth"
        >
          <li>
            <a
              className={`mb-5 md:mb-0 hover:border-main hover:border-b-[0.2rem]
              ${activeSection === "hero" && "border-main border-b-[0.2rem]"}
              transition-all duration-200 ease-in-out`}
              href="#hero"
              onClick={() => {
                setActiveSection(sections[0]);
                setShowMenu(!showMenu);
              }}
            >
              {t("home")}
            </a>
          </li>
          <li>
            <a
              className={`mb-5 md:mb-0 hover:border-main hover:border-b-[0.2rem]
              ${activeSection === "services" && "border-main border-b-[0.2rem]"}
              transition-all duration-200 ease-in-out`}
              href="#services"
              onClick={() => {
                setActiveSection(sections[1]);
                setShowMenu(!showMenu);
              }}
            >
              {t("services")}
            </a>
          </li>
          <li>
            <a
              className={`mb-5 md:mb-0 hover:border-main hover:border-b-[0.2rem]
              ${activeSection === "experience" && "border-main border-b-[0.2rem]"}
              transition-all duration-200 ease-in-out`}
              href="#experience"
              onClick={() => {
                setActiveSection(sections[2]);
                setShowMenu(!showMenu);
              }}
            >
              {t("experience")}
            </a>
          </li>
          <li>
            <a
              className={`mb-5 md:mb-0 hover:border-main hover:border-b-[0.2rem]
              ${activeSection === "projects" && "border-main border-b-[0.2rem]"}
              transition-all duration-200 ease-in-out`}
              href="#projects"
              onClick={() => {
                setActiveSection(sections[3]);
                setShowMenu(!showMenu);
              }}
            >
              {t("projects")}
            </a>
          </li>
          <li>
            <a
              className={`mb-5 md:mb-0 hover:border-main hover:border-b-[0.2rem]
              ${activeSection === "contact" && "border-main border-b-[0.2rem]"}
              transition-all duration-200 ease-in-out`}
              href="#contact"
              onClick={() => {
                setActiveSection(sections[4]);
                setShowMenu(!showMenu);
              }}
            >
              {t("contact")}
            </a>
          </li>
          <li>
            <ThemeChanger />
          </li>
          <li>
            <LanguageChanger />
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Header;
