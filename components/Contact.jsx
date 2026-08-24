"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Contact — direct conversation panel.
 *
 * The panel begins as a compact mark and expands as the section enters the
 * viewport. This keeps the contact CTA visually quiet until it is actually
 * encountered, while preserving the direct mail action and #contact anchor.
 */
export default function Contact() {
  const sectionRef = useRef(null);
  const panelRef = useRef(null);
  const [formOpen, setFormOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Opening the form changes the panel's intrinsic height after the scroll
  // timeline has already measured it. Re-anchor it on the next paint so the
  // larger card grows upward and its bottom edge stays inside the section.
  const skipFirstAnchor = useRef(true);
  useEffect(() => {
    const panel = panelRef.current;
    const section = sectionRef.current;
    // On mount the card must stay in its collapsed pre-scroll state, so the
    // first run is skipped; afterwards both opening *and* closing re-anchor.
    // Closing without this left the shrunken card floating mid-section.
    if (skipFirstAnchor.current) {
      skipFirstAnchor.current = false;
      return;
    }
    if (!panel || !section) return;
    // min-height is transitioned over 0.5s, so a single rAF measures a
    // mid-transition height and anchors the card past the section bottom.
    // Re-anchor on each frame of the transition and once more when it ends.
    const anchor = () => {
      gsap.set(panel, {
        xPercent: -50,
        clipPath: "inset(0px 0px)",
        y: (section.clientHeight - panel.offsetHeight) / 2,
      });
    };
    let frame = requestAnimationFrame(function loop() {
      anchor();
      frame = requestAnimationFrame(loop);
    });
    const stop = () => {
      cancelAnimationFrame(frame);
      anchor();
    };
    panel.addEventListener("transitionend", stop);
    const safety = setTimeout(stop, 900);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(safety);
      panel.removeEventListener("transitionend", stop);
    };
  }, [formOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    const organization = String(data.get("organization") || "").trim();

    if (!name || !email || !message) {
      setStatus({ type: "error", message: "Please fill in the required fields." });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch("/api/contact", {
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
      if (!response.ok) throw new Error("Request failed");
      form.reset();
      setStatus({ type: "success", message: "Message sent successfully." });
    } catch {
      setStatus({ type: "error", message: "Could not send message. Please email directly." });
    } finally {
      setLoading(false);
    }
  };

  useGSAP(
    () => {
      const panel = panelRef.current;
      const section = sectionRef.current;
      if (!panel || !section) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // The card renders at full size with its content already laid out; a
      // clip-path window is what grows. Scaling the panel instead would
      // scale the text with it, and fading the text in made it appear on
      // scroll rather than simply being revealed.
      const SQUARE = 12;

      const finalY = () => (section.clientHeight - panel.offsetHeight) / 2;
      // The clipped window is centred, so the travelling square's centre is
      // the panel's centre; offset the panel so that centre starts at the top.
      const startY = () => -panel.offsetHeight / 2 + SQUARE / 2;
      const closedClip = () =>
        `inset(${(panel.offsetHeight - SQUARE) / 2}px ${
          (panel.offsetWidth - SQUARE) / 2
        }px)`;

      const applyBase = () => {
        gsap.set(panel, { xPercent: -50 });
      };

      if (reduceMotion) {
        applyBase();
        gsap.set(panel, {
          y: finalY(),
          clipPath: "inset(0px 0px)",
          autoAlpha: 1,
        });
        return;
      }

      applyBase();
      gsap.set(panel, {
        y: startY(),
        clipPath: closedClip(),
        autoAlpha: 1,
      });

      const tween = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          // The contact section is the last block on the page. Ends tied to
          // the section geometry ("top 18%", "bottom bottom") are unreachable
          // because the document runs out of scroll first, and a short fixed
          // range made the square finish its descent while the section was
          // still below the fold. "max" spends exactly the remaining page
          // scroll, so the square travels the line in view.
          start: "top 85%",
          end: "max",
          // Lenis drives the scroll loop and goes idle when input stops, so a
          // smoothed scrub (e.g. 0.7) leaves its catch-up tween permanently
          // ~10% short: the panel froze at scale 0.897 / opacity 0.9. Direct
          // scrub maps progress with no catch-up tween to stall.
          scrub: true,
          invalidateOnRefresh: true,
          onRefresh: applyBase,
        },
      });
      tween
        // The square outruns the rising section if it starts immediately and
        // eases out, dropping below the fold mid-descent. Starting at 15% and
        // moving linearly keeps it on screen for the whole travel.
        .to(panel, { y: finalY, duration: 0.6, ease: "none" }, 0.15)
        // The window opens over the already-rendered content.
        .to(
          panel,
          { clipPath: "inset(0px 0px)", duration: 0.25, ease: "power2.out" },
          0.75
        );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section id="contact" ref={sectionRef} className="contact-panel-wrap">
      <div className="contact-panel-stage" aria-hidden="true" />
      <div ref={panelRef} className={`contact-panel${formOpen ? " is-form-open" : ""}`}>
        <button
          type="button"
          className="contact-panel-title"
          onClick={() => setFormOpen((open) => !open)}
          aria-expanded={formOpen}
        >
          <span aria-hidden="true" className="contact-bracket">[</span>
          <span>{formOpen ? "Close conversation" : "Start a conversation"}</span>
          <span aria-hidden="true" className="contact-bracket">]</span>
        </button>
        <div className="contact-panel-rule" aria-hidden="true" />
        {!formOpen && <p className="contact-panel-email">
          or write directly{" "}
          <a href="mailto:abhinavyadav8@gmail.com">
            abhinavyadav8@gmail.com
            <ArrowRight aria-hidden="true" size={22} strokeWidth={1.5} />
          </a>
        </p>}
        {formOpen && (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-grid">
              <label>
                Name
                <input name="name" type="text" required autoComplete="name" />
              </label>
              <label>
                Organization
                <input name="organization" type="text" autoComplete="organization" />
              </label>
              <label>
                Email
                <input name="email" type="email" required autoComplete="email" />
              </label>
              <label>
                Message
                <textarea name="message" rows={3} required />
              </label>
            </div>
            <div className="contact-form-actions">
              <button type="submit" disabled={loading} className="contact-form-submit">
                {loading ? "Sending..." : "Send"} <ArrowRight aria-hidden="true" size={18} />
              </button>
            </div>
            {status && <p className={`contact-form-status is-${status.type}`} role="status">{status.message}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
