import Preview from "./components/preview";
import Image from "next/image";
import Startpage from "@assets/img/startpage.png";
import Todo from "@assets/img/todo.png";

const Projects = () => {
  return (
    <section id="projects">
      <h2 className="mb-10">Some of the projects I have done:</h2>
      <div
        className="flex flex-col justify-center gap-10 md:gap-0 md:justify-between
        w-full md:flex-row"
      >
        <Preview
          description="Tired of messy bookmarks, I created my own Startpage, my own custom home page for the browser, which streamlines website access with a custom home page that includes my essential links."
          url="https://lecav-startpage.netlify.app/"
        >
          <Image
            src={Startpage}
            alt="My own Startpage"
            className="w-full h-full rounded-xl"
          />
        </Preview>
        <Preview
          description="A basic project for any frontend developer to carry out in order to test my knowledge in React, designed without using backend to focus only on frontend development."
          url="https://todoapp-lecav.netlify.app"
        >
          <Image
            src={Todo}
            alt="My Todo App"
            className="w-full h-full rounded-xl"
          />
        </Preview>
      </div>
    </section>
  );
};

export default Projects;
