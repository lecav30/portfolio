import { Mail, Linkedin, Github, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer
      className="flex flex-col gap-12 h-full items-center mt-32 mb-16 sm:flex-row
      sm:justify-between sm:gap-0"
    >
      <div className="flex flex-col gap-8">
        <h3 className="text-center sm:text-start">To know more about me:</h3>
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
          <a
            href="https://www.instagram.com/sebastian_lev9/"
            target="_blank"
            className="btn btn-primary"
          >
            <Instagram />
          </a>
        </div>
      </div>

      <div className="flex gap-2 sm:flex-col sm:items-center">
        <p>Click here to see my </p>
        <a
          href="/resume/"
          target="_blank"
          className="dark:text-white text-main font-bold hover:underline"
        >
          Résumé
        </a>
      </div>
    </footer>
  );
};

export default Footer;
