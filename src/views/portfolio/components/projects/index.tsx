import Preview from "./components/preview";
import Image from "next/image";
import Startpage from "@assets/img/startpage.png";

const Projects = () => {
  return (
    <section id="projects">
      <h2 className="mb-10">Some of the projects I have done:</h2>
      <div className="flex flex-col justify-center md:flex-row">
        <Preview description="Tired of messy bookmarks, I created my own Startpage, my own custom home page for the browser, which streamlines website access with a custom home page that includes my essential links.">
          <Image
            src={Startpage}
            alt="My own Startpage"
            className="w-full h-full rounded-xl"
          />
        </Preview>
      </div>
    </section>
  );
};

export default Projects;
