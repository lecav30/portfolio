"use client";
import { ChangeEvent, FormEvent, useState } from "react";
import Styles from "./styles.module.css";
import { useTranslations } from "next-intl";

const Contact = () => {
  const t = useTranslations("Contact");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const formDataObj = new FormData();
    formDataObj.append("name", formData.name);
    formDataObj.append("email", formData.email);
    formDataObj.append("message", formData.message);

    try {
      const formUrl = process.env.NEXT_PUBLIC_FORMSPREE_FORM_URL || "";
      const res = await fetch(formUrl, {
        method: "POST",
        body: formDataObj,
        headers: {
          Accept: "application/json",
        },
      });

      if (res.ok) {
        alert("Message sent successfully");
        setFormData({ name: "", email: "", message: "" });
      } else {
        alert("Failed to send message");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    <section id="contact" className="flex flex-col justify-center">
      <article className="flex flex-col gap-12 lg:gap-0 lg:flex-row">
        <aside className="flex flex-col gap-12 justify-center items-center lg:items-start w-full lg:w-6/12">
          <h1 className="text-2xl md:text-4xl text-[--main-color] font-bold text-center lg:text-start">
            {t("contactComment")}
          </h1>
          <h2 className="md:text-xl w-5/6 text-center lg:text-start">
            {t("contactIntro")}
          </h2>
        </aside>
        <form
          className="flex flex-col gap-6 items-center w-full md:gap-12 lg:w-6/12"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-y-8 md:flex-row md:justify-between w-full">
            <div className={Styles.input__div}>
              <label htmlFor="name">{t("name")}</label>
              <input
                className={Styles.input__style}
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className={Styles.input__div}>
              <label htmlFor="email">{t("email")}</label>
              <input
                className={Styles.input__style}
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="flex flex-col w-full">
            <label htmlFor="message">{t("message")}</label>
            <textarea
              className={`${Styles.input__style} resize-y`}
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <input
            className="w-4/6 md:w-3/6 bg-main text-white font-bold rounded-lg h-10"
            type="submit"
            value={t("submit")}
          />
        </form>
      </article>
    </section>
  );
};

export default Contact;
