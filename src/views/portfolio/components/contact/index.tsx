import Styles from "./styles.module.css";

const Contact = () => {
  return (
    <section id="contact" className="flex flex-col justify-center">
      <article className="flex flex-col gap-12 lg:gap-0 lg:flex-row">
        <aside className="flex flex-col gap-12 justify-center items-center lg:items-start w-full lg:w-6/12">
          <h1 className="text-2xl md:text-4xl text-[--main-color] font-bold text-center lg:text-start">
            Send me a message!
          </h1>
          <h2 className="md:text-xl w-5/6 text-center lg:text-start">
            {`Contact me if you need my services and let's create something great!`}
          </h2>
        </aside>
        <form className="flex flex-col gap-6 items-center w-full md:gap-12 lg:w-6/12">
          <div className="flex flex-col gap-y-8 md:flex-row md:justify-between w-full">
            <div className={Styles.input__div}>
              <label htmlFor="name">Name</label>
              <input
                className={Styles.input__style}
                type="text"
                id="name"
                name="name"
                required
              />
            </div>
            <div className={Styles.input__div}>
              <label htmlFor="email">Email</label>
              <input
                className={Styles.input__style}
                type="email"
                id="email"
                name="email"
                required
              />
            </div>
          </div>
          <div className="flex flex-col w-full">
            <label htmlFor="message">Message</label>
            <textarea
              className={`${Styles.input__style} resize-y`}
              id="message"
              name="message"
              required
            ></textarea>
          </div>
          <input
            className="w-4/6 md:w-3/6 bg-main text-white font-bold rounded-lg h-10"
            type="submit"
            value="Submit"
          />
        </form>
      </article>
    </section>
  );
};

export default Contact;
