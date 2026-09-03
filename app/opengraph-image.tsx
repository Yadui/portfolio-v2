import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/site";

export const runtime = "edge";
export const alt = "Abhinav Yadav — Software Engineer & Cloud/AI Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";


export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#ede6d6",
        }}
      >
        {/* ── Map background ─────────────────────────────────────────────── */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${SITE_URL}/og-map.png`}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />

        {/* ── Dark scrim — left two-thirds, fades right so map stays visible */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(100deg, rgba(5,5,10,0.92) 0%, rgba(5,5,10,0.88) 45%, rgba(5,5,10,0.3) 70%, transparent 100%)",
          }}
        />

        {/* ── Bottom scrim — anchors text area */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 180,
            background:
              "linear-gradient(to top, rgba(5,5,10,0.75) 0%, transparent 100%)",
          }}
        />

        {/* ── Content ────────────────────────────────────────────────────── */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "64px 72px",
            width: "60%",
          }}
        >
          {/* Kicker */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#00ff99",
              }}
            />
            <span
              style={{
                color: "#00ff99",
                fontSize: 15,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontFamily: "monospace",
              }}
            >
              yadui.dev
            </span>
          </div>

          {/* Name */}
          <div
            style={{
              color: "#ffffff",
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              marginBottom: 20,
              fontFamily: "serif",
            }}
          >
            Abhinav Yadav
          </div>

          {/* Role */}
          <div
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 26,
              fontWeight: 400,
              lineHeight: 1.4,
              marginBottom: 40,
              fontFamily: "sans-serif",
            }}
          >
            Software Engineer · Cloud &amp; AI
          </div>

          {/* Tags */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["Azure", "Next.js", "AI Pipelines", "Delhi NCR"].map((tag) => (
              <div
                key={tag}
                style={{
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 4,
                  padding: "6px 16px",
                  color: "rgba(255,255,255,0.65)",
                  fontSize: 15,
                  fontFamily: "monospace",
                  letterSpacing: "0.08em",
                  background: "rgba(255,255,255,0.05)",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom-right coords — mirrors the poster aesthetic ──────────── */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            right: 48,
            color: "rgba(255,255,255,0.35)",
            fontSize: 13,
            fontFamily: "serif",
            letterSpacing: "0.06em",
          }}
        >
          28°38′N  77°11′E
        </div>
      </div>
    ),
    { ...size }
  );
}
