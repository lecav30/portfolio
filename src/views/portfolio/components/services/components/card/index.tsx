"use client";
import React, { FC, useState, useEffect } from "react";
import { useTheme } from "next-themes";

interface Props {
  title: string;
  children?: React.ReactNode;
  description: string;
  skills: string[];
}

const Card: FC<Props> = (props) => {
  const [showTechnologies, setShowTechnologies] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [screenWidth, setScreenWidth] = useState<number>(0);

  useEffect(() => {
    setScreenWidth(window.innerWidth);
  }, []);

  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isDesktop = screenWidth >= 1060;

  const handleShowAbout = () => {
    setShowAbout(!showAbout);
  };

  const handleShowTechnologies = () => {
    setShowTechnologies(!showTechnologies);
  };

  if (isDesktop) {
    return (
      <div
        className={`${resolvedTheme === "dark" && "shadow-white/20"} shadow-lg rounded-xl
          hover:border-main hover:border-s-4 hover:border-b-[3px] min-h-[310px]
          relative border__show flex gap-12 py-5 px-10`}
      >
        <div
          id="presentation"
          className="flex flex-col justify-center items-center gap-5"
          onClick={handleShowAbout}
        >
          <h1 className="text-2xl text-center font-bold">{props.title}</h1>
          {props.children}
        </div>
        <div id="about" className="p-4 flex flex-col gap-12  max-w-[704px]">
          <p className="mt-4">{props.description}</p>
          <div>
            <p className="mb-4 font-semibold">Technologies that I have used:</p>
            <ul id="skills" className="flex flex-wrap gap-4 ">
              {props.skills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${resolvedTheme === "dark" && "shadow-white/20"} shadow-lg p-4 rounded-xl
        hover:border-main hover:border-s-4 hover:border-b-[3px] min-h-[310px] min-w-[240px]
        max-w-[310px] relative border__show`}
    >
      {!showAbout && (
        <div
          id="presentation"
          className="flex flex-col justify-center items-center"
          onClick={handleShowAbout}
        >
          {props.children}
          <h1 className="text-2xl text-center">{props.title}</h1>
        </div>
      )}
      {showAbout && (
        <div id="about" className="p-4 flex flex-col">
          <button
            onClick={handleShowAbout}
            className="w-8 absolute top-4 left-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline
                className="dark__svg"
                fill={resolvedTheme == "dark" ? "#fff" : "#000"}
                points="9 14 4 9 9 4"
              ></polyline>
              <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
            </svg>
          </button>
          <br />
          <h1 className="text-2xl">{props.title}</h1>
          <p className="mt-4">{props.description}</p>
          <button
            className="my-4 bg-[#6600FF] py-1 px-3 border border-black
            rounded-3xl text-white w-fit self-center"
            onClick={handleShowTechnologies}
          >
            Show technologies
          </button>
          {showTechnologies && (
            <ul id="skills" className="flex flex-wrap">
              {props.skills.map((skill, index) => (
                <li key={index} className="px-4">
                  {skill}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Card;
