"use client";
import Image from "next/image";
import Avatar from "@assets/svg/my-avatar.svg";
import { useTranslations } from "next-intl";

const Hero = () => {
  const t = useTranslations("Hero");

  return (
    <section
      id="hero"
      className="flex flex-col justify-end gap-12 items-center mt-24 md:mt-0 md:gap-8
      md:justify-normal md:flex-row lg:justify-between"
    >
      <div>
        <h1 className="text-4xl text-center sm:text-[2.5rem] lg:text-5xl md:text-start font-bold">
          {t("greeting")} Sebastián Lévano
        </h1>
        <h3 className="italic mt-4 text-center md:text-2xl md:text-start">
          {t("degree")}{" "}
          <a
            href="https://www.upc.edu.pe/"
            target="_blank"
            className="text-red-500 hover:underline"
          >
            UPC
          </a>
        </h3>
        <p className="mt-2 text-center font-semibold md:mt-8 md:text-2xl md:text-start">
          {t("job")}{" "}
          <a
            href="https://impulsastudio.pe/"
            target="_blank"
            className="text-main italic hover:underline"
          >
            Impulsa Studio
          </a>
        </p>
      </div>
      <Image
        className="w-auto h-60 md:h-80 lg:h-96"
        src={Avatar}
        alt="Lecav's Avatar"
      />
    </section>
  );
};

export default Hero;
