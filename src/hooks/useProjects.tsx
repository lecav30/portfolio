"use client";
import Fastporte from "@assets/img/fastporte.webp";
import MontaltoAsociados from "@assets/img/montalto.webp";
import NoHaySinSuerte from "@assets/img/nhss.webp";
import NotFound from "@assets/img/notfound.webp";
import Rwf from "@assets/img/rapidwebforge.webp";
import RwfDocs from "@assets/img/rwfdocs.webp";
import RwfLanding from "@assets/img/rwflanding.webp";
import Startpage from "@assets/img/startpage.webp";
import Todo from "@assets/img/todo.webp";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import useWindowSize from "./useWindowSize";

const useProjects = () => {
  const t = useTranslations("Projects");
  const { resolvedTheme } = useTheme();
  const screenWidth = useWindowSize();

  const projects = [
    {
      name: "No Hay Sin Suerte",
      description: t("nhssDescription"),
      url: "https://jorgitoluna.com/",
      urlText: "jorgitoluna.com",
      image: NoHaySinSuerte,
      contributions: t("nhssContributions"),
      techUsed:
        "Next.js, TypeScript, Redux Toolkit, TailwindCSS, Niubiz, Google Tag Manager, Microsoft Azure",
    },
    {
      name: "Montalto Asociados",
      description: t("montaltoDescription"),
      url: "https://montaltoasociados.com/",
      urlText: "montaltoasociados.com",
      image: MontaltoAsociados,
      contributions: t("montaltoContributions"),
      techUsed:
        "React, TypeScript, Redux Toolkit, TailwindCSS, react-i18next, Formik, Vite, JWT, GoDaddy",
    },
    {
      name: "RapidWebForge Landing Page",
      description: t("rwfLandingDescription"),
      url: "https://rapidwebforge.netlify.app",
      urlText: "rapidwebforge.netlify.app",
      image: RwfLanding,
      contributions: "",
      techUsed: "Next.js, TypeScript, TailwindCSS, Netlify",
    },
    {
      name: "RapidWebForge Documentation",
      description: t("rwfDocsDescription"),
      url: "https://rapidwebforge-docs.netlify.app",
      urlText: "rapidwebforge-docs.netlify.app",
      image: RwfDocs,
      contributions: "",
      techUsed: "Docusaurus, React, Markdown, TypeScript, CSS, Netlify",
    },
    {
      name: "RapidWebForge",
      description: t("rwfDescription"),
      url: "https://github.com/RapidWebForge/RapidWebForgeApp",
      urlText: "github.com/RapidWebForge/RapidWebForgeApp",
      image: Rwf,
      contributions: "",
      techUsed:
        "C++, CMake, Babel, JavaScript, NgInx, MySQL, Inja, SQLite, GitHub Deployments",
    },
    {
      name: "Startpage",
      description: t("startpageDescription"),
      url: "https://lecav-startpage.netlify.app/",
      urlText: "lecav-startpage.netlify.app",
      image: Startpage,
      contributions: "",
      techUsed:
        "React, TypeScript, Redux Toolkit, TailwindCSS, React Cookies, Netlify",
    },
    {
      name: "My Todo App",
      description: t("todoDescription"),
      url: "https://todoapp-lecav.netlify.app",
      urlText: "todoapp-lecav.netlify.app",
      image: Todo,
      contributions: "",
      techUsed:
        "React, TypeScript, Redux Toolkit, TailwindCSS, Netlify, Vite, Github Actions",
    },
    {
      name: "Fastporte",
      description: t("fastporteDescription"),
      url: "https://fastporte.netlify.app/login",
      urlText: "fastporte.netlify.app",
      image: Fastporte,
      contributions: "",
      techUsed:
        "Next.js, TypeScript, Redux Toolkit, TailwindCSS, Web Sockets, JWT, Netlify",
    },
  ];

  const [modals, setModals] = useState({
    open: false,
    page: {
      name: "",
      description: "",
      url: "",
      urlText: "",
      image: NotFound,
      contributions: "",
      techUsed: "",
    },
  });

  const [pageSize, setPageSize] = useState(4);
  const [index, setIndex] = useState(0);
  const [showedProjects, setShowedProjects] = useState(
    projects.slice(0, pageSize)
  );

  useEffect(() => {
    setShowedProjects(projects.slice(index, index + pageSize));
  }, [index, pageSize]);

  useEffect(() => {
    setIndex(0);
    setPageSize(screenWidth < 768 ? 2 : 4);
  }, [screenWidth]);

  return {
    projects,
    t,
    index,
    setIndex,
    pageSize,
    resolvedTheme,
    showedProjects,
    modals,
    setModals,
  };
};

export default useProjects;
