import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Abhinav Yadav — Software Engineer & Cloud/AI Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #050816 0%, #0d1117 50%, #111827 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 88px",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        {/* Accent glow top-right */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,255,153,0.18) 0%, transparent 70%)",
          }}
        />
        {/* Warm glow top-left */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,191,115,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Tag line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#00ff99",
            }}
          />
          <span
            style={{
              color: "#00ff99",
              fontSize: 18,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            abhinavyadav.dev
          </span>
        </div>

        {/* Name */}
        <div
          style={{
            color: "#ffffff",
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: 24,
          }}
        >
          Abhinav Yadav
        </div>

        {/* Role */}
        <div
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 30,
            fontWeight: 400,
            marginBottom: 48,
          }}
        >
          Software Engineer · Cloud &amp; AI Developer
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {["Azure", "Next.js", "React", "AI Pipelines", "Hackathon Winner"].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  border: "1px solid rgba(0,255,153,0.35)",
                  borderRadius: 999,
                  padding: "8px 22px",
                  color: "rgba(255,255,255,0.75)",
                  fontSize: 18,
                  background: "rgba(0,255,153,0.06)",
                }}
              >
                {tag}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
