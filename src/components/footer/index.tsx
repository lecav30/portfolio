"use client";
import { Mail, Linkedin, Github } from "lucide-react";
import { useTranslations } from "next-intl";

const Footer = () => {
  const t = useTranslations("Footer");

  return (
    <div
      className="flex flex-col gap-12 h-full items-center mt-32 mb-16 sm:flex-row
      sm:justify-between sm:gap-0"
    >
      <div className="flex flex-col gap-8">
        <h3 className="text-center sm:text-start">{t("footerKnowMe")}</h3>
        <div
          className="flex justify-center gap-8 sm:gap-16"
          id="social-networks"
        >
          <a
            href="mailto:lecav30@outlook.com"
            target="_blank"
            className="btn btn-primary"
          >
            <Mail />
          </a>
          <a
            href="https://www.linkedin.com/in/sebastianlev/"
            target="_blank"
            className="btn btn-primary"
          >
            <Linkedin />
          </a>
          <a
            href="https://github.com/lecav30"
            target="_blank"
            className="btn btn-primary"
          >
            <Github />
          </a>
        </div>
      </div>

      <div className="flex gap-2 sm:flex-col sm:items-center">
        <p>{t("resumeClick")}</p>
        <a
          href="/resume/"
          target="_blank"
          className="dark:text-white text-main font-bold hover:underline"
        >
          {t("resume")}
        </a>
      </div>
    </div>
  );
};

export default Footer;
