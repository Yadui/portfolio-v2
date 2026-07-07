"use client";

import { useState, useRef, useCallback } from "react";
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
  const textareaRef = useRef(null);

  // Auto-expand: reset to "auto" first so the field can also shrink.
  const handleTextareaInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

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
        if (textareaRef.current) textareaRef.current.style.height = "auto";
      } else {
        setStatus({ type: "error", message: "Failed to send message." });
      }
    } catch {
      setStatus({ type: "error", message: "An error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative contact-fill bg-black text-white"
    >
      {/* Typographic watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-end justify-start overflow-hidden"
      >
        <span
          className="select-none font-heading font-light leading-none text-white"
          style={{
            fontSize: "clamp(6rem, 22vw, 20rem)",
            opacity: 0.028,
            letterSpacing: "-0.05em",
            lineHeight: 0.85,
            whiteSpace: "nowrap",
            paddingLeft: "0.05em",
          }}
        >
          TALK
        </span>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-5 pb-2 pt-[clamp(2rem,5vh,4rem)] md:px-10">

        {/* GET IN TOUCH YOUR WAY */}
        <div className="mb-[clamp(1.5rem,3vh,3rem)] flex items-center gap-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">
            Get in touch your way
          </h2>
          <ArrowDown size={18} strokeWidth={2} className="text-white" />
        </div>

        {/* Contact grid */}
        <div className="mb-[clamp(1.5rem,4vh,3.5rem)] grid grid-cols-1 gap-y-4 sm:grid-flow-col sm:grid-cols-none sm:grid-rows-2 sm:gap-x-24 sm:gap-y-5 max-w-2xl justify-start">
          {contactLinks.map((item, idx) => {
            const inner = (
              <span className="flex min-w-0 items-center gap-3">
                <span className="shrink-0">{item.icon}</span>
                <span className="truncate text-xs font-bold uppercase tracking-widest text-white">
                  {item.value}
                </span>
              </span>
            );
            return (
              <div key={item.label} className="min-w-0">
                {/* Faint separator between the two rows on desktop */}
                {idx === 2 && (
                  <div aria-hidden="true" className="mb-4 hidden h-px w-full max-w-[240px] bg-white/10 sm:block" />
                )}
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : "_self"}
                    rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                    aria-label={item.label}
                    className="block min-w-0 transition-opacity hover:opacity-60"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="min-w-0 cursor-default">{inner}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mb-[clamp(1.5rem,3vh,3rem)] flex items-center gap-3 md:ml-[42%]">
          <ArrowDown size={18} strokeWidth={2} className="text-white" />
          <p className="text-sm font-bold uppercase tracking-widest">
            <span className="text-white/30 line-through decoration-white/30">
              Or the right way
            </span>{" "}
            <span className="text-white">or my way</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-4xl">

          {/* Row 1 */}
          <div className="mb-[clamp(1rem,2.5vh,2rem)] grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-10">
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

          {/* Row 2 */}
          <div className="mb-[clamp(1.5rem,3vh,2.5rem)] grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-10">
            <div className="border-b border-white/20 pb-2">
              <input
                name="email"
                type="email"
                placeholder="EMAIL"
                className="w-full bg-transparent text-xs font-bold uppercase tracking-widest text-white placeholder:text-white/30 outline-none"
                required
              />
            </div>
            {/* Auto-expanding message */}
            <div className="border-b border-white/20 pb-2">
              <textarea
                ref={textareaRef}
                name="message"
                placeholder="MESSAGE"
                rows={1}
                onInput={handleTextareaInput}
                className="w-full resize-none overflow-hidden bg-transparent text-xs font-bold uppercase tracking-widest text-white placeholder:text-white/30 outline-none"
                required
              />
            </div>
          </div>

          {/* Send */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80 disabled:opacity-40"
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
              {/* Underline draws in on hover */}
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full"
              />
            </button>
          </div>

          {status && (
            <div
              role="status"
              aria-live="polite"
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


