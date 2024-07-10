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
        description="My background in frontend development began in 2021 at the university, where I focused on the Angular and VueJS frameworks. Currently, I also have practical experience in ReactJS and NextJS through my professional work."
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
        description="My foundational knowledge in backend development was established in 2021 through my university studies, primarily focusing on the ASP.NET and Spring Boot frameworks. Additionally, I gained hands-on experience with Flask while working on small university projects."
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
        description="I embarked on my mobile development journey in 2022 at the university, mastering the Flutter framework. Furthermore, I've gained practical experience in React Native through my professional endeavors."
        skills={["Flutter - Dart", "React Native"]}
      >
        <Mobile />
      </Card>
    </section>
  );
};

export default Services;
