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
            My internship proved invaluable in expanding my front-end skillset
            through projects involving{" "}
            <span className="font-semibold">NextJS</span> and{" "}
            <span className="font-semibold">ReactJS</span>. At{" "}
            <a
              className="font-semibold text-main"
              href="https://impulsastudio.pe/"
            >
              Impulsa Studio
            </a>
            , I actively contributed to their web development initiatives,
            gaining practical experience and contributing to their success.
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
