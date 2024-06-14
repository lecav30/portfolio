import Header from "@components/header";
import Hero from "./components/hero";
import Services from "./components/services";
import Experience from "./components/experience";
import Projects from "./components/projects";
import Contact from "./components/contact";
import Footer from "@/components/footer";

const Portfolio = () => {
  return (
    <>
      <header>
        <Header />
      </header>
      <main className="space-y-20 w-[95%] mt-32 max-w-5xl mx-auto">
        <Hero />
        <Services />
        <Experience />
        <Projects />
        <Contact />
      </main>
      <footer className="w-[95%] max-w-5xl mx-auto">
        <Footer />
      </footer>
    </>
  );
};

export default Portfolio;
