"use client";
import NotFound from "@assets/img/notfound.webp";
import useProjects from "@hooks/useProjects";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Preview from "./components/preview";
import ProjectsModal from "./components/projectsModal";

const Projects = () => {
  const {
    projects,
    t,
    index,
    setIndex,
    pageSize,
    resolvedTheme,
    showedProjects,
    modals,
    setModals,
  } = useProjects();

  return (
    <section id="projects">
      <h2 className="mb-10">{t("projectsIntro")}</h2>
      <div className="w-full flex flex-col md:flex-row md:justify-between items-center gap-10 md:gap-0">
        <button
          className="hidden md:block"
          onClick={() => setIndex(index - pageSize)}
          disabled={index === 0}
        >
          {resolvedTheme === "dark" ? (
            <ChevronLeft color={index === 0 ? "#808080" : "white"} />
          ) : (
            <ChevronLeft color={index === 0 ? "#808080" : "#000"} />
          )}
        </button>
        <div className="flex flex-col flex-wrap justify-center items-center w-full md:flex-row gap-10">
          {showedProjects.map((project) => (
            <Preview
              key={project.name}
              name={project.name}
              onClick={() => {
                setModals({
                  open: true,
                  page: {
                    name: project.name,
                    description: project.description,
                    url: project.url,
                    urlText: project.urlText,
                    image: project.image ?? NotFound,
                    contributions: project.contributions,
                    techUsed: project.techUsed,
                  },
                });
              }}
            >
              <Image
                src={project.image}
                alt={project.name}
                fill
                className="w-full h-full rounded-xl"
              />
            </Preview>
          ))}
        </div>
        <div className="flex gap-10">
          <button
            className="md:hidden"
            onClick={() => setIndex(index - pageSize)}
            disabled={index === 0}
          >
            {resolvedTheme === "dark" ? (
              <ChevronLeft color={index === 0 ? "#808080" : "white"} />
            ) : (
              <ChevronLeft color={index === 0 ? "#808080" : "#000"} />
            )}
          </button>
          <button
            onClick={() => setIndex(index + pageSize)}
            disabled={index === projects.length - pageSize}
          >
            {resolvedTheme === "dark" ? (
              <ChevronRight
                color={
                  index === projects.length - pageSize ? "#808080" : "white"
                }
              />
            ) : (
              <ChevronRight
                color={
                  index === projects.length - pageSize ? "#808080" : "#000"
                }
              />
            )}
          </button>
        </div>
      </div>
      <ProjectsModal
        open={modals.open}
        onClose={() =>
          setModals({
            open: false,
            page: {
              name: "",
              description: "",
              url: "",
              image: NotFound,
              contributions: "",
              techUsed: "",
              urlText: "",
            },
          })
        }
        name={modals.page.name}
        image={modals.page.image}
        imageAlt={modals.page.name}
        description={modals.page.description}
        contributions={
          modals.page.contributions !== ""
            ? modals.page.contributions
            : undefined
        }
        url={modals.page.url}
        urlText={modals.page.urlText}
        techUsed={modals.page.techUsed}
      />
    </section>
  );
};

export default Projects;
