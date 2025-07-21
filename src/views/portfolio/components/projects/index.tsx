"use client";
import Preview from "./components/preview";
import Image from "next/image";
import Startpage from "@assets/img/startpage.png";
import Todo from "@assets/img/todo.png";
import { useTranslations } from "next-intl";

const Projects = () => {
  const t = useTranslations("Projects");

  return (
    <section id="projects">
      <h2 className="mb-10">{t("projectsIntro")}</h2>
      <div
        className="flex flex-col justify-center gap-10 md:gap-0 md:justify-between
        w-full md:flex-row"
      >
        <Preview
          description={t("startpageDescription")}
          url="https://lecav-startpage.netlify.app/"
        >
          <Image
            src={Startpage}
            alt="My own Startpage"
            className="w-full h-full rounded-xl"
          />
        </Preview>
        <Preview
          description={t("todoDescription")}
          url="https://todoapp-lecav.netlify.app"
        >
          <Image
            src={Todo}
            alt="My Todo App"
            className="w-full h-full rounded-xl"
          />
        </Preview>
      </div>
    </section>
  );
};

export default Projects;
