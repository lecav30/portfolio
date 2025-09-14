"use client";
import Card from "./components/card";
import Frontend from "./components/frontend";
import Backend from "./components/backend";
import Mobile from "./components/mobile";
import { useTranslations } from "next-intl";

const Services = () => {
  const t = useTranslations("Services");

  return (
    <section
      id="services"
      className="flex flex-col gap-y-8 gap-x-10 items-center justify-center mt-8 md:flex-row
      md:flex-wrap xl:justify-between"
    >
      <Card
        title={t("frontend")}
        description={t("frontendDescription")}
        skills={[
          "HTML",
          "CSS",
          "SCSS",
          "JavaScript",
          "TypeScript",
          "Next.js",
          "React",
          "Vue.js",
          "Angular",
          "Astro",
        ]}
      >
        <Frontend />
      </Card>
      <Card
        title={t("backend")}
        description={t("backendDescription")}
        skills={[
          "SprintBoot - Java",
          "Flask - Python",
          "Express.js - TypeScript",
          "MySQL",
          "PostgreSQL",
          "SQLServer",
          "MongoDB",
        ]}
      >
        <Backend />
      </Card>
      <Card
        title={t("mobile")}
        description={t("mobileDescription")}
        skills={["React Native"]}
      >
        <Mobile />
      </Card>
    </section>
  );
};

export default Services;
