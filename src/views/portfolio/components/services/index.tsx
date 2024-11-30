"use client";
import Card from "./components/card";
import Frontend from "./components/frontend";
import Backend from "./components/backend";
import Mobile from "./components/mobile";

const Services = () => {
  return (
    <section
      id="services"
      className="flex flex-col gap-y-8 gap-x-10 items-center justify-center mt-8 md:flex-row
      md:flex-wrap xl:justify-between"
    >
      <Card
        title="Frontend Development"
        description="My journey in frontend development began in 2021 during university, where I focused on frameworks like Angular and Vue.js. Since then, I have gained practical experience with React.js and Next.js through my professional work."
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
        title="Backend Development"
        description="My foundational knowledge in backend development was established in 2021 during my university studies, where I primarily focused on frameworks like ASP.NET and Spring Boot. Additionally, I gained hands-on experience with Flask while working on small-scale university projects."
        skills={[
          "ASP.NET - C#",
          "SprintBoot - Java",
          "Flask - Python",
          "MySQL",
          "PostgreSQL",
          "MongoDB",
        ]}
      >
        <Backend />
      </Card>
      <Card
        title="Mobile Development"
        description="I began my mobile development journey in 2022 during university, where I focused on mastering the Flutter framework. Additionally, I have gained practical experience with React Native through my professional work."
        skills={["Flutter - Dart", "React Native"]}
      >
        <Mobile />
      </Card>
    </section>
  );
};

export default Services;
