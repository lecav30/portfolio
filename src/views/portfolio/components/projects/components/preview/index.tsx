"use client";
import { FC, ReactNode, useState } from "react";

interface PreviewProps {
  description: string;
  children?: ReactNode;
}

const Preview: FC<PreviewProps> = (props) => {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div
      onMouseEnter={() => setShowAbout(true)}
      onMouseLeave={() => setShowAbout(false)}
      onClick={() => setShowAbout(!showAbout)}
      className="max-w-[420px] max-h-[320px] rounded-xl shadow-lg relative"
    >
      <div
        className={`${
          showAbout ? "opacity-100" : "opacity-0"
        } bg-main text-white text-[14px] md:text-base
        absolute w-full h-full rounded-xl p-4 transition-opacity duration-300
        ease-in-out flex flex-col justify-center items-center`}
      >
        <p className="text-center">{props.description}</p>
        <button
          className="mt-5 border-2 border-white bg-main w-fit rounded-lg px-2
          py-1"
          onClick={() =>
            window.open("https://lecav-startpage.netlify.app/", "_blank")
          }
        >
          Visit website
        </button>
      </div>

      {props.children}
    </div>
  );
};

export default Preview;
