"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsGithub, BsArrowUpRight } from "react-icons/bs";
import Link from "next/link";
import Image from "next/image";

import { projects } from "@/data/projectsMenuData";
import PageIntro from "@/components/PageIntro";

const Work = () => {
  const [filter, setFilter] = useState("all");

  const filteredProjects = projects.filter((project) =>
    filter === "all" ? true : project.workCategory.toLowerCase() === filter
  );

  const tabs = ["all", "cloud", "web", "ai"];

  return (
    <section className="min-h-screen bg-[#fffdf8] pb-24 pt-28 text-[#101828]">
      <div className="container mx-auto px-4">
        <PageIntro
          kicker="Selected work"
          title="Projects"
          lede="Cloud, AI and product builds. Each one is a system I designed, shipped and still maintain."
          actions={
            /* Filters live with the intro so the page opens with one block
               rather than a centred header stacked on a centred pill row. */
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  aria-pressed={filter === tab}
                  className={`rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    filter === tab
                      ? "border-[#101828] bg-[#101828] text-[#fffdf8]"
                      : "border-[#101828]/15 bg-transparent text-[#536074] hover:border-[#101828]/40 hover:text-[#101828]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          }
        />

        <motion.div
          layout
          /* Asymmetric: the lead project spans two columns so the grid has a
             focal point instead of three identical tiles. */
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 [&>*:first-child]:md:col-span-2"
        >
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={project.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#101828]/10 bg-white/80 shadow-[0_18px_60px_rgba(16,24,40,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#101828]/25 hover:shadow-[0_28px_90px_rgba(16,24,40,0.14)]"
              >
                {/* Image / Visual */}
                <div className="relative h-[240px] w-full overflow-hidden bg-[#efeae0]">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(max-width: 748px) 100vw, (max-width: 960px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#101828]/5 to-transparent">
                      <h3 className="text-4xl font-light text-[#101828]/15 transition-colors group-hover:text-[#00b86b]/30">
                        {project.workCategory}
                      </h3>
                    </div>
                  )}

                  {/* Overlay Links */}
                  <div className="absolute inset-0 flex items-center justify-center gap-4 bg-[#101828]/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {project.links.github && (
                      <Link
                        href={project.links.github}
                        target="_blank"
                        aria-label={`${project.title} on GitHub`}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#101828] transition-colors hover:bg-[#00ff99]"
                      >
                        <BsGithub className="text-2xl" />
                      </Link>
                    )}
                    {project.links.live && (
                      <Link
                        href={project.links.live}
                        target="_blank"
                        aria-label={`${project.title} live site`}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#101828] transition-colors hover:bg-[#00ff99]"
                      >
                        <BsArrowUpRight className="text-2xl" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <h3 className="text-2xl font-light text-[#101828] transition-colors group-hover:text-[#00805b]">
                      {project.title}
                    </h3>
                    <span className="rounded bg-[#101828]/5 px-2 py-1 text-xs font-bold uppercase text-[#536074]">
                      {project.workCategory}
                    </span>
                  </div>

                  <p className="mb-6 flex-1 text-[#536074]">{project.thesis}</p>

                  <div className="mt-auto flex flex-wrap gap-2">
                    {project.stack.map((tech, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-[#00ff99]/15 px-3 py-1 text-xs font-bold text-[#00734a]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default Work;
