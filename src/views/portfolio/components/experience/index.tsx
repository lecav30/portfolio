"use client";
import React from "./components/react";
import NextJS from "./components/nextjs";
import Azure from "./components/azure";
import TailwindCSS from "./components/tailwindcss";
import { useTranslations } from "next-intl";

const Experience = () => {
  const t = useTranslations("Experience");

  return (
    <section
      id="experience"
      className="flex justify-center lg:justify-start items-center"
    >
      <ol className="relative border-l-2 border-gray-700 h-fit">
        <li className="ms-4">
          <div className="absolute w-3 h-3 rounded-full mt-1.5 -start-1.5 border border-gray-900 bg-gray-700" />
          <time className="mb-1 text-sm leading-none">
            {t("internshipDate")}
          </time>
          <h3 className="text-lg font-semibold capitalize">
            {t("internship")}
          </h3>
          <p className="mb-4">{t("internshipDescription")}</p>
        </li>
        <li className="ms-4">
          <div className="absolute w-3 h-3 rounded-full mt-1.5 -start-1.5 border border-gray-900 bg-gray-700" />
          <time className="mb-1 text-sm leading-none">
            {t("impulsaJuniorDate")}
          </time>
          <h3 className="text-lg font-semibold capitalize">
            Software Engineer Junior
          </h3>
          <p className="mb-4">{t("impulsaJuniorDescription")}</p>
          <div className="flex items-center">
            <p className="pr-5">Stack:</p>
            <div className="flex items-center gap-x-8 flex-wrap">
              <NextJS />
              <React />
              <TailwindCSS />
              <Azure />
            </div>
          </div>
          <div className="flex items-center">
            <p className="pr-5">{t("websites")}</p>
            <div className="flex items-center gap-x-8 flex-wrap">
              <a
                href="https://www.jorgitoluna.com/"
                target="_blank"
                className="text-main hover:underline"
              >
                No hay sin suerte
              </a>
              <a
                href="https://tucambista.pe/"
                target="_blank"
                className="text-main hover:underline"
              >
                Tucambista
              </a>
            </div>
          </div>
          <div className="flex items-center">
            <p className="pr-5">{t("mobile")}</p>
            <div className="flex items-center gap-x-8 flex-wrap">
              <a
                href="https://apps.apple.com/us/app/tucambista/id1617892951"
                target="_blank"
                className="text-main hover:underline"
              >
                Tucambista (iOS)
              </a>
            </div>
          </div>
        </li>
      </ol>
    </section>
  );
};

export default Experience;
