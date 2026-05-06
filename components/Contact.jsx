"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FaEnvelope, FaMapMarkedAlt, FaLinkedin } from "react-icons/fa";
import ScrambledText from "@/components/ScrambledText";

const links = [
  {
    icon: <FaLinkedin />,
    label: "LinkedIn",
    value: "abhinavyadav88",
    href: "https://www.linkedin.com/in/abhinavyadav88",
    external: true,
  },
  {
    icon: <FaEnvelope />,
    label: "Email",
    value: "abhinavyadav8@gmail.com",
    href: "mailto:abhinavyadav8@gmail.com",
    external: false,
  },
  {
    icon: <FaMapMarkedAlt />,
    label: "Location",
    value: "Gurgaon",
    href: null,
    external: false,
  },
];

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      setStatus({ type: "error", message: "Please fill in all fields." });
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
      className="portfolio-section portfolio-paper-stage flex min-h-screen flex-col items-center justify-center pb-0"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(16,24,40,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,24,40,0.04) 1px, transparent 1px)",
            backgroundSize: "92px 92px",
            maskImage:
              "linear-gradient(180deg, rgba(0,0,0,0.42), transparent 100%)",
          }}
        />
        <div className="absolute left-[10%] top-28 h-48 w-48 rounded-full bg-[var(--portfolio-sun-soft)] blur-3xl" />
        <div className="absolute right-[10%] top-16 h-52 w-52 rounded-full bg-[var(--portfolio-accent-soft)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center px-4 md:px-6">
        <ScrambledText
          as="h2"
          text="Let's Connect"
          triggerOnView
          duration={1.05}
          speed={0.7}
          className="portfolio-title text-center text-4xl md:text-5xl"
        />

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex w-full flex-col gap-4"
        >
          <Input
            name="name"
            type="text"
            placeholder="Name"
            className="h-12 rounded-xl border-[rgba(16,24,40,0.12)] bg-white/86 px-4 text-[var(--portfolio-ink)] placeholder:text-[var(--portfolio-ink-faint)] focus-visible:ring-[var(--portfolio-accent)]"
            required
          />
          <Input
            name="email"
            type="email"
            placeholder="Email"
            className="h-12 rounded-xl border-[rgba(16,24,40,0.12)] bg-white/86 px-4 text-[var(--portfolio-ink)] placeholder:text-[var(--portfolio-ink-faint)] focus-visible:ring-[var(--portfolio-accent)]"
            required
          />
          <Textarea
            name="message"
            placeholder="Message"
            className="min-h-[140px] resize-none rounded-xl border-[rgba(16,24,40,0.12)] bg-white/86 p-4 text-[var(--portfolio-ink)] placeholder:text-[var(--portfolio-ink-faint)] focus-visible:ring-[var(--portfolio-accent)]"
            required
          />
          <Button
            size="lg"
            className="h-12 w-full rounded-xl bg-[var(--portfolio-ink)] text-base font-semibold tracking-[0.08em] text-white transition-all hover:bg-[rgba(16,24,40,0.92)]"
            disabled={loading}
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Send"
            )}
          </Button>
          {status && (
            <div
              className={`rounded-xl border p-3 text-center text-sm font-medium ${
                status.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {status.message}
            </div>
          )}
        </form>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {links.map((item) => {
            const inner = (
              <span className="flex items-center gap-2 text-sm font-medium text-[var(--portfolio-ink-soft)] transition-colors hover:text-[var(--portfolio-accent)]">
                <span className="text-base text-[var(--portfolio-ink)]">
                  {item.icon}
                </span>
                {item.value}
              </span>
            );
            return (
              <li key={item.label}>
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.external ? "_blank" : "_self"}
                    rel={item.external ? "noreferrer" : undefined}
                    aria-label={item.label}
                  >
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </li>
            );
          })}
        </ul>
      </div>

    </section>
  );
};

export default Contact;
