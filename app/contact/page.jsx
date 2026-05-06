"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Image from "next/image";
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

const info = [
  {
    icon: <FaLinkedin />,
    description: "View Profile",
    link: "https://www.linkedin.com/in/abhinavyadav88",
    isExternal: true,
  },
  {
    icon: <FaEnvelope />,
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
import { motion } from "framer-motion";
import { useState } from "react";

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
        transition: { delay: 2.4, duration: 0.4, ease: "easeIn" },
      }}
      className="py-10"
    >
      <div className="container mx-auto">
        <div className="flex flex-col xl:flex-row gap-[30px]">
          {/* form */}
          <div className="xl:w-[54%] order-2 xl:order-none">
            <form
              className="flex flex-col gap-6 p-10 bg-[#27272c] rounded-xl"
              onSubmit={handleSubmit}
            >
              <h3 className="text-4xl text-accent">Lets Work together</h3>
              <p className="text-white/60">
                Collaborate with me to bring your ideas to life with creativity
                and precision.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  name="firstname"
                  type="text"
                  placeholder="Firstname"
                  className="rounded-xl"
                  required
                />
                <Input
                  name="lastname"
                  type="text"
                  placeholder="Lastname"
                  className="rounded-xl"
                  required
                />
                <Input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  className="rounded-xl"
                />
                <Input
                  name="phone"
                  type="tel"
                  placeholder="Phone number"
                  className="rounded-xl"
                />
              </div>
              <Select onValueChange={(value) => setService(value)} value={service}>
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Select a query type" />
                </SelectTrigger>
                <SelectContent className="bg-primary rounded-xl">
                  <SelectGroup>
                    <SelectLabel>Query Type</SelectLabel>
                    <SelectItem value="job">Job Query</SelectItem>
                    <SelectItem value="project">Project Query</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {service === "other" && (
                <Input
                  name="otherService"
                  type="text"
                  placeholder="Please specify"
                  className="rounded-xl"
                  required
                  value={otherService}
                  onChange={(e) => setOtherService(e.target.value)}
                />
              )}
              {/* textarea */}
              <Textarea
                name="message"
                className="h-[200px] resize-none rounded-xl"
                placeholder="Type your message here."
                required
              />
              {/* btn */}
              <Button size="md" className="max-w-40" disabled={loading}>
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Send message"
                )}
              </Button>
              {status?.type === "success" && (
                <div className="text-green-500 text-sm mt-2">{status.message}</div>
              )}
              {status?.type === "error" && (
                <div className="text-red-500 text-sm mt-2">{status.message}</div>
              )}
            </form>
          </div>
          <div className="flex-1 flex items-center xl:justify-end xl:order-1 mb-8 xl:mb-0 xl:text-left">
            <ul className="flex flex-row xl:flex-col gap-10 flex-wrap justify-center w-full bg-[#27272c] p-8 rounded-xl">
              {info.map((item, index) => {
                return (
                  <li key={index} className="flex items-center gap-6">
                    <div className="w-[52px] h-[52px] xl:h-[72px] xl:w-[72px] bg-[#27272c] text-accent rounded-full flex items-center justify-center ">
                      {item.link ? (
                        <a
                          href={item.link}
                          target={item.isExternal ? "_blank" : "_self"}
                          rel={item.isExternal ? "noopener noreferrer" : ""}
                          className="hover:scale-125 transition-all"
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
                          className="hover:text-accent transition-all"
                        >
                          <p className="mb-1">{item.title}</p>
                          <h3 className={!item.isExternal ? "underline" : ""}>
                            {item.description}
                          </h3>
                        </a>
                      ) : (
                        <>
                          <p>{item.title}</p>
                          <h3>{item.description}</h3>
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
