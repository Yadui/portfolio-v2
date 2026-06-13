"use client";

import { useState } from "react";
import { MdOutlineEmail, MdOutlineTimer } from "react-icons/md";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { ArrowRight, ArrowDown } from "lucide-react";

const contactLinks = [
  {
    icon: <MdOutlineEmail className="text-[#4d5dff] text-xl" />,
    label: "Email",
    value: "abhinavyadav8@gmail.com",
    href: "mailto:abhinavyadav8@gmail.com",
  },
  {
    icon: <FaGithub className="text-[#4d5dff] text-xl" />,
    label: "GitHub",
    value: "Github",
    href: "https://github.com/abhinavyadav88",
  },
  {
    icon: <MdOutlineTimer className="text-[#4d5dff] text-xl" />,
    label: "Response",
    value: "24 Hours",
    href: null,
  },
  {
    icon: <FaLinkedinIn className="text-[#4d5dff] text-xl" />,
    label: "LinkedIn",
    value: "LinkedIn",
    href: "https://www.linkedin.com/in/abhinavyadav88",
  },
];

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const organization = form.organization.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      setStatus({ type: "error", message: "Please fill in all required fields." });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: name,
          organization,
          email,
          message,
          to: "abhinavyadav8+port@gmail.com",
        }),
      });

      if (res.ok) {
        setStatus({ type: "success", message: "Message sent successfully!" });
        form.reset();
      } else {
        setStatus({ type: "error", message: "Failed to send message." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "An error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative min-h-screen bg-black text-white"
    >
      <div className="mx-auto max-w-5xl px-10 pt-40 pb-24">

        {/* ── "GET IN TOUCH YOUR WAY" ── */}
        <div className="mb-14 flex items-center gap-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">
            Get in touch your way
          </h2>
          <ArrowDown size={18} strokeWidth={2} className="text-white" />
        </div>

        {/* ── Contact grid (2 left, 2 right) ── */}
        <div className="mb-20 grid grid-flow-col grid-rows-2 gap-y-7 gap-x-24 max-w-2xl justify-start">
          {contactLinks.map((item) => {
            const inner = (
              <span className="flex items-center gap-3">
                {item.icon}
                <span className="text-xs font-bold uppercase tracking-widest text-white">
                  {item.value}
                </span>
              </span>
            );

            return (
              <div key={item.label}>
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : "_self"}
                    rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                    aria-label={item.label}
                    className="transition-opacity hover:opacity-60"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="cursor-default">{inner}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Divider: "OR THE RIGHT WAY OR MY WAY" ── */}
        <div className="mb-14 flex items-center gap-3 md:ml-[42%]">
          <ArrowDown size={18} strokeWidth={2} className="text-white" />
          <p className="text-sm font-bold uppercase tracking-widest">
            <span className="text-white/30 line-through decoration-white/30">
              Or the right way
            </span>{" "}
            <span className="text-white">or my way</span>
          </p>
        </div>

        {/* ── Contact form ── */}
        <form onSubmit={handleSubmit} className="max-w-4xl">
          {/* Row 1: Name + Organization */}
          <div className="mb-8 grid grid-cols-2 gap-10">
            <div className="border-b border-white/20 pb-2">
              <input
                name="name"
                type="text"
                placeholder="NAME"
                className="w-full bg-transparent text-xs font-bold uppercase tracking-widest text-white placeholder:text-white/30 outline-none"
                required
              />
            </div>
            <div className="border-b border-white/20 pb-2">
              <input
                name="organization"
                type="text"
                placeholder="ORGANIZATION"
                className="w-full bg-transparent text-xs font-bold uppercase tracking-widest text-white placeholder:text-white/30 outline-none"
              />
            </div>
          </div>

          {/* Row 2: Email + Message */}
          <div className="mb-10 grid grid-cols-2 gap-10">
            <div className="border-b border-white/20 pb-2">
              <input
                name="email"
                type="email"
                placeholder="EMAIL"
                className="w-full bg-transparent text-xs font-bold uppercase tracking-widest text-white placeholder:text-white/30 outline-none"
                required
              />
            </div>
            <div className="border-b border-white/20 pb-2">
              <textarea
                name="message"
                placeholder="MESSAGE"
                rows={1}
                className="w-full resize-none bg-transparent text-xs font-bold uppercase tracking-widest text-white placeholder:text-white/30 outline-none"
                required
              />
            </div>
          </div>

          {/* Send button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-60 disabled:opacity-40"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending…
                </span>
              ) : (
                <>
                  Send <ArrowRight size={18} strokeWidth={2} />
                </>
              )}
            </button>
          </div>

          {/* Status message */}
          {status && (
            <div
              className={`mt-6 rounded border px-4 py-3 text-center text-xs font-bold uppercase tracking-widest ${
                status.type === "success"
                  ? "border-green-500/30 bg-green-500/10 text-green-300"
                  : "border-red-500/30 bg-red-500/10 text-red-300"
              }`}
            >
              {status.message}
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default Contact;
