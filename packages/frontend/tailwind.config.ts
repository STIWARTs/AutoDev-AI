import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Space Grotesk", "Georgia", "serif"],
        body: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        brand: {
          bg:            "#080c18",
          surface:       "#0d1224",
          card:          "#111828",
          border:        "rgba(255,255,255,0.07)",
          muted:         "#4f5e80",
          "text-secondary": "#9ba8c5",
          text:          "#f0f4ff",
          accent:        "#818cf8",
          DEFAULT:       "#6366f1",
        },
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
        primary: {
          DEFAULT: "#6366f1",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#0d1224",
          foreground: "#f0f4ff",
        },
        muted: {
          DEFAULT: "#111828",
          foreground: "#9ba8c5",
        },
        accent: {
          DEFAULT: "#111828",
          foreground: "#f0f4ff",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "#6366f1",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":  "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-brand":  "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
        "gradient-glass":  "linear-gradient(135deg, rgba(15,20,42,0.8) 0%, rgba(10,14,30,0.9) 100%)",
      },
      animation: {
        "fade-in":     "fadeIn 400ms ease-out both",
        "slide-up":    "slideUp 400ms ease-out both",
        "slide-right": "slideRight 350ms ease-out both",
        "float":       "float 4s ease-in-out infinite",
        "glow-pulse":  "glowPulse 3s ease-in-out infinite",
        "aurora":      "aurora 16s ease infinite",
        "shimmer":     "shimmer 1.5s infinite",
        "spin-slow":   "spin 4s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideRight: {
          "0%":   { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":       { transform: "translateY(-6px)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(99,102,241,0.15)" },
          "50%":       { boxShadow: "0 0 40px rgba(99,102,241,0.35)" },
        },
        aurora: {
          "0%":   { backgroundPosition: "0% 50%" },
          "50%":  { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0"  },
        },
      },
      boxShadow: {
        "glow-indigo": "0 0 40px rgba(99,102,241,0.2), 0 0 80px rgba(99,102,241,0.08)",
        "glow-sm":     "0 2px 16px rgba(99,102,241,0.25)",
        "card":        "0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset",
        "card-hover":  "0 8px 40px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.1)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
