import React from "./components/react";
import NextJS from "./components/nextjs";
import Azure from "./components/azure";
import TailwindCSS from "./components/tailwindcss";

const Experience = () => {
  return (
    <section
      id="experience"
      className="flex justify-center lg:justify-start items-center"
    >
      <ol className="relative border-l-2 border-gray-700 h-fit">
        <li className="ms-4">
          <div className="absolute w-3 h-3 rounded-full mt-1.5 -start-1.5 border border-gray-900 bg-gray-700" />
          <time className="mb-1 text-sm leading-none">October 2023</time>
          <h3 className="text-lg font-semibold capitalize">
            Front end developer pre-professional intern
          </h3>
          <p className="mb-4">
            My pre-professional internship proved invaluable in expanding my
            frontend development skills through projects involving frameworks
            like <span className="font-semibold">NextJS</span> and{" "}
            <span className="font-semibold">ReactJS</span>. At At Impulsa Studio{" "}
            <a
              className="font-semibold text-main"
              href="https://impulsastudio.pe/"
            >
              Impulsa Studio
            </a>
            , I actively contributed to their web development initiatives,
            gaining hands-on experience and playing a key role in the success of
            multiple web pages. (
            <span className="font-semibold">
              TypeScript, HTML5, CSS3, React, Next.js, responsive design,
              Microsoft Azure
            </span>
            ). I also used <span className="font-semibold">C#/.NET</span> and{" "}
            <span className="font-semibold">SQL</span> when tasked with
            backend-related responsibilities.
          </p>
        </li>
        <li className="ms-4">
          <div className="absolute w-3 h-3 rounded-full mt-1.5 -start-1.5 border border-gray-900 bg-gray-700" />
          <time className="mb-1 text-sm leading-none">October 2024</time>
          <h3 className="text-lg font-semibold capitalize">
            Software Engineer Junior
          </h3>
          <p className="mb-4">
            After a year of internship, I was promoted to continue my work at{" "}
            <a
              className="font-semibold text-main"
              href="https://impulsastudio.pe/"
            >
              Impulsa Studio
            </a>
            , carrying out frontend development tasks for the creation and
            content updates of websites such as{" "}
            <a
              className="font-semibold text-main"
              href="https://jorgitoluna.com"
            >
              No hay sin suerte
            </a>{" "}
            and{" "}
            <a className="font-semibold text-main" href="https://tucambista.pe">
              TuCambista
            </a>
            . Additionally, I contributed to improving the mobile application.
          </p>
          <div className="flex items-center">
            <p className="pr-5">Stack:</p>
            <div className="flex items-center gap-x-8 flex-wrap">
              <NextJS />
              <React />
              <TailwindCSS />
              <Azure />
            </div>
          </div>
        </li>
      </ol>
    </section>
  );
};

export default Experience;
