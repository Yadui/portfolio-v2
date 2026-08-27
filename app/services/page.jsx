"use client";

import { BsArrowDownRight } from "react-icons/bs";
import Link from "next/link";
import { motion } from "framer-motion";

import { services } from "@/data/siteContent";
import PageIntro from "@/components/PageIntro";

const EASE = [0.22, 1, 0.36, 1];

const Services = () => {
  return (
    <section className="flex min-h-[80vh] flex-col justify-center bg-[#fffdf8] pb-16 pt-28 text-[#101828]">
      <div className="container mx-auto">
        <PageIntro
          kicker="What I can do for you"
          title="Services"
          lede="Cloud infrastructure, AI workflows and full-stack delivery, scoped to what the problem actually needs."
        />

        <div className="grid grid-cols-1 gap-[60px] md:grid-cols-2">
          {services.map((service, index) => {
            const anchorId = service.href.includes("#")
              ? service.href.split("#")[1]
              : undefined;

            return (
              <motion.div
                key={service.num}
                id={anchorId}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease: EASE, delay: (index % 2) * 0.1 }}
                className="group flex flex-1 flex-col justify-center gap-6"
              >
                {/* Number + link */}
                <div className="flex w-full items-center justify-between">
                  <div className="text-outline-ink text-5xl font-extrabold text-transparent transition-all duration-500 group-hover:text-outline-hover">
                    {service.num}
                  </div>
                  <motion.div
                    whileHover={{ rotate: -45, scale: 1.1 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Link
                      href="/contact"
                      aria-label={`Discuss ${service.title}`}
                      className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[#101828] transition-all duration-500 group-hover:bg-[#00ff99]"
                    >
                      <BsArrowDownRight className="text-3xl text-[#fffdf8] transition-colors duration-500 group-hover:text-[#101828]" />
                    </Link>
                  </motion.div>
                </div>

                {/* Title */}
                <h2 className="text-[42px] font-bold leading-none text-[#101828] transition-all duration-500 group-hover:text-[#00805b]">
                  {service.title}
                </h2>

                {/* Description */}
                <p className="text-[#536074]">{service.description}</p>

                {/* Border */}
                <div className="w-full border-b border-[#101828]/15" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
