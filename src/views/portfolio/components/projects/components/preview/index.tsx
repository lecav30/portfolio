"use client";
import { useTranslations } from "next-intl";
import { FC, ReactNode, useState } from "react";

interface PreviewProps {
  children?: ReactNode;
  name?: string;
  onClick?: () => void;
}

const Preview: FC<PreviewProps> = (props) => {
  const t = useTranslations("Projects");
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div>
      <p className="text-center text-sm md:text-base mb-bottom mb-5">
        {props.name}
      </p>
      <div
        onMouseEnter={() => setShowAbout(true)}
        onMouseLeave={() => setShowAbout(false)}
        onClick={() => setShowAbout(!showAbout)}
        className="relative"
      >
        <div
          className={`${showAbout ? "opacity-100" : "opacity-0"} bg-main
          absolute w-full h-full rounded-xl p-4 transition-opacity duration-300
          ease-in-out flex flex-col justify-center items-center z-20`}
        >
          <button
            className="bg-main rounded-lg px-2 py-1 text-white text-sm md:text-base
            w-full h-full"
            onClick={props.onClick}
          >
            {t("viewMore")}
          </button>
        </div>

        <div className="w-[340px] md:w-[360px] h-[200px] md:h-[220px] rounded-xl shadow-lg relative">
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default Preview;
