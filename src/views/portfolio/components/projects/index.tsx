"use client";
import Preview from "./components/preview";
import Image from "next/image";
import Startpage from "@assets/img/startpage.webp";
import Todo from "@assets/img/todo.webp";
import Fastporte from "@assets/img/fastporte.webp";
import RwfLanding from "@assets/img/rwflanding.webp";
import RwfDocs from "@assets/img/rwfdocs.webp";
import Rwf from "@assets/img/rapidwebforge.webp";
import { useTranslations } from "next-intl";

const Projects = () => {
  const t = useTranslations("Projects");

  const projects = [
    {
      name: "Startpage",
      description: t("startpageDescription"),
      url: "https://lecav-startpage.netlify.app/",
      image: Startpage,
      alt: "My own Startpage",
    },
    {
      name: "Todo",
      description: t("todoDescription"),
      url: "https://todoapp-lecav.netlify.app",
      image: Todo,
      alt: "My Todo App",
    },
    {
      name: "Fastporte",
      description: t("fastporteDescription"),
      url: "https://fastporte.netlify.app/login",
      image: Fastporte,
    },
    {
      name: "RWF Landing",
      description: t("rwfLandingDescription"),
      url: "https://rapidwebforge.netlify.app",
      image: RwfLanding,
      alt: "RapidWebForge Landing Page",
    },
    {
      name: "RWF Docs",
      description: t("rwfDocsDescription"),
      url: "https://rapidwebforge-docs.netlify.app",
      image: RwfDocs,
      alt: "RapidWebForge Documentation",
    },
    {
      name: "RapidWebForge",
      description: t("rwfDescription"),
      url: "https://github.com/RapidWebForge/RapidWebForgeApp",
      image: Rwf,
    },
  ];

  return (
    <section id="projects">
      <h2 className="mb-10">{t("projectsIntro")}</h2>
      <div
        className="flex flex-col flex-wrap justify-center items-center
        w-full md:flex-row gap-10 gap-y-5"
      >
        {projects.map((project) => (
          <Preview
            key={project.name}
            description={project.description}
            url={project.url}
          >
            <Image
              src={project.image}
              alt={project?.alt ?? project.name}
              className="w-full h-full rounded-xl"
            />
          </Preview>
        ))}
      </div>
    </section>
  );
};

export default Projects;
