/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  safelist: [
    // Icon background colours used dynamically in Skills.tsx via inline style.
    // These are always applied as inline styles so they don't need safelisting.
    // Keeping the list as a static set of real classes instead of a regex that
    // Tailwind warns about (uppercase hex never matches any generated class).
    "bg-[#E44D26]", "bg-[#1572B6]", "bg-[#F7DF1E]", "bg-[#61DBFB]",
    "bg-[#F24E1E]", "bg-[#68A063]", "bg-[#3776AB]", "bg-[#38BDF8]",
  ],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "15px",
    },
    screens: {
      sm: "640px",
      md: "748px",
      lg: "960px",
      xl: "1200px",
    },
    fontFamily: {
      // Canonical role-based tokens
      body: ["var(--font-clash-display)", "ui-sans-serif", "system-ui", "sans-serif"],
      heading: ["var(--font-clash-grotesk)", "ui-sans-serif", "system-ui", "sans-serif"],
      morsa: ["var(--font-morsa)", "ui-sans-serif", "system-ui", "sans-serif"],
      // Funky accent font — for highlighted words in the Intro headline
      comma: ["var(--font-ff-comma)", "Georgia", "ui-serif", "serif"],
      // Fenotype Letters — hero highlight (AI systems)
      letters: ["var(--font-letters)", "Georgia", "ui-serif", "serif"],
      // Fenotype Letters II — hero highlight (cloud infrastructure)
      "letters-ii": ["var(--font-letters-ii)", "Georgia", "ui-serif", "serif"],
      // Legacy aliases
      primary: ["var(--font-clash-display)", "ui-sans-serif", "system-ui", "sans-serif"],
      electro: ["var(--font-clash-grotesk)", "ui-sans-serif", "system-ui", "sans-serif"],
      qubiko: ["var(--font-clash-grotesk)", "ui-sans-serif", "system-ui", "sans-serif"],
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: "#1c1c22",

        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "#00ff99",
          foreground: "#00e187",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
        borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        orbit: "orbit calc(var(--duration)*1s) linear infinite",
      },
      keyframes: {
        orbit: {
          "0%": {
            transform: "rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)",
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
