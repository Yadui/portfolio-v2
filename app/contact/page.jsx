"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectLabel,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FaEnvelope, FaMapMarkedAlt, FaLinkedin } from "react-icons/fa";
import { motion } from "framer-motion";
import PageIntro from "@/components/PageIntro";
import { useState } from "react";

const info = [
  {
    icon: <FaLinkedin />,
    title: "LinkedIn",
    description: "View Profile",
    link: "https://www.linkedin.com/in/abhinavyadav88",
    isExternal: true,
  },
  {
    icon: <FaEnvelope />,
    title: "Email",
    description: "abhinavyadav8@gmail.com",
    link: "mailto:abhinavyadav8@gmail.com",
    isExternal: false,
  },
  {
    icon: <FaMapMarkedAlt />,
    title: "Address",
    description: "Gurugram, Haryana",
  },
];

const fieldLabelClass =
  "mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#536074]";

const Contact = () => {
  const [service, setService] = useState("");
  const [otherService, setOtherService] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const firstname = form.firstname.value.trim();
    const lastname = form.lastname.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const message = form.message.value.trim();
    const otherServiceValue = form.otherService ? form.otherService.value.trim() : "";

    if (!firstname) {
      setStatus({ type: "error", message: "Firstname is required." });
      return;
    }
    if (!lastname) {
      setStatus({ type: "error", message: "Lastname is required." });
      return;
    }
    if (!message) {
      setStatus({ type: "error", message: "Message is required." });
      return;
    }
    if (!email && !phone) {
      setStatus({ type: "error", message: "Please provide at least an email or a phone number." });
      return;
    }
    if (service === "other" && !otherServiceValue) {
      setStatus({ type: "error", message: "Please specify the other service." });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const bodyData = {
        firstname,
        lastname,
        email,
        phone,
        service,
        message,
        to: "abhinavyadav8+port@gmail.com",
      };
      if (service === "other") {
        bodyData.otherService = otherServiceValue;
      }

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        setStatus({ type: "success", message: "Message sent successfully!" });
        form.reset();
        setService("");
        setOtherService("");
      } else {
        setStatus({ type: "error", message: "Failed to send message. Please try again." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { delay: 0.1, duration: 0.5, ease: "easeOut" },
      }}
      className="min-h-screen bg-[#fffdf8] pb-16 pt-28 text-[#101828]"
    >
      <div className="container mx-auto">
        <PageIntro
          kicker="Get in touch"
          title="Let's work together"
          lede="Tell me what you are building and where it is stuck. I read every message and reply personally."
        />

        <div className="flex flex-col gap-[30px] xl:flex-row">
          {/* form */}
          <div className="order-2 xl:order-none xl:w-[54%]">
            <form
              className="flex flex-col gap-6 rounded-2xl border border-[#101828]/10 bg-white/80 p-10 shadow-[0_24px_80px_rgba(16,24,40,0.1)]"
              onSubmit={handleSubmit}
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="contact-firstname" className={fieldLabelClass}>
                    Firstname *
                  </label>
                  <Input
                    id="contact-firstname"
                    name="firstname"
                    type="text"
                    placeholder="Firstname"
                    className="w-full rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contact-lastname" className={fieldLabelClass}>
                    Lastname *
                  </label>
                  <Input
                    id="contact-lastname"
                    name="lastname"
                    type="text"
                    placeholder="Lastname"
                    className="w-full rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className={fieldLabelClass}>
                    Email
                  </label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder="Email address"
                    className="w-full rounded-xl"
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className={fieldLabelClass}>
                    Phone
                  </label>
                  <Input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    placeholder="Phone number"
                    className="w-full rounded-xl"
                  />
                </div>
              </div>
              <div>
                <span className={fieldLabelClass}>Query type</span>
                <Select onValueChange={(value) => setService(value)} value={service}>
                  <SelectTrigger className="w-full rounded-xl border-[#101828]/15 bg-white/85 text-[#101828]">
                    <SelectValue placeholder="Select a query type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-[#101828]/10 bg-[#fffdf8] text-[#101828]">
                    <SelectGroup>
                      <SelectLabel>Query Type</SelectLabel>
                      <SelectItem value="job">Job Query</SelectItem>
                      <SelectItem value="project">Project Query</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {service === "other" && (
                <div>
                  <label htmlFor="contact-other" className={fieldLabelClass}>
                    Please specify *
                  </label>
                  <Input
                    id="contact-other"
                    name="otherService"
                    type="text"
                    placeholder="Please specify"
                    className="w-full rounded-xl"
                    required
                    value={otherService}
                    onChange={(e) => setOtherService(e.target.value)}
                  />
                </div>
              )}
              {/* textarea */}
              <div>
                <label htmlFor="contact-message" className={fieldLabelClass}>
                  Message *
                </label>
                <Textarea
                  id="contact-message"
                  name="message"
                  className="h-[200px] resize-none rounded-xl"
                  placeholder="Type your message here."
                  required
                />
              </div>
              {/* btn */}
              <Button size="md" className="max-w-40" disabled={loading}>
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
                ) : (
                  "Send message"
                )}
              </Button>
              <div role="status" aria-live="polite">
                {status?.type === "success" && (
                  <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                    {status.message}
                  </div>
                )}
                {status?.type === "error" && (
                  <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {status.message}
                  </div>
                )}
              </div>
            </form>
          </div>
          <div className="order-1 mb-8 flex flex-1 items-center xl:order-none xl:mb-0 xl:justify-end xl:text-left">
            <ul className="flex w-full flex-row flex-wrap justify-center gap-10 rounded-2xl border border-[#101828]/10 bg-white/80 p-8 shadow-[0_24px_80px_rgba(16,24,40,0.1)] xl:flex-col">
              {info.map((item, index) => {
                return (
                  <li key={index} className="flex items-center gap-6">
                    <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#00ff99]/15 text-xl text-[#00805b] xl:h-[72px] xl:w-[72px]">
                      {item.link ? (
                        <a
                          href={item.link}
                          target={item.isExternal ? "_blank" : "_self"}
                          rel={item.isExternal ? "noopener noreferrer" : ""}
                          aria-label={item.title}
                          className="flex h-full w-full items-center justify-center rounded-full transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00805b]"
                        >
                          <div>{item.icon}</div>
                        </a>
                      ) : (
                        <div>{item.icon}</div>
                      )}
                    </div>
                    <div>
                      {item.link ? (
                        <a
                          href={item.link}
                          target={item.isExternal ? "_blank" : "_self"}
                          rel={item.isExternal ? "noopener noreferrer" : ""}
                          className="transition-all hover:text-[#00805b]"
                        >
                          <p className="mb-1 text-sm text-[#8892a4]">{item.title}</p>
                          <h3 className={`text-[#101828] ${!item.isExternal ? "underline" : ""}`}>
                            {item.description}
                          </h3>
                        </a>
                      ) : (
                        <>
                          <p className="mb-1 text-sm text-[#8892a4]">{item.title}</p>
                          <h3 className="text-[#101828]">{item.description}</h3>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default Contact;
