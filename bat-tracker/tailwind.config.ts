import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bat: {
          black: "#0a0a0a",
          dark: "#111111",
          gray: "#1a1a1a",
          steel: "#2a2a2a",
          yellow: "#f5c518",
          gold: "#d4a017",
          smoke: "#888888",
          light: "#cccccc",
          green: "#22c55e",
          red: "#ef4444",
          blue: "#3b82f6",
          purple: "#a855f7",
        },
      },
      fontFamily: {
        cinzel: ["Cinzel", "serif"],
        rajdhani: ["Rajdhani", "sans-serif"],
      },
      animation: {
        "slide-up": "slideUp 0.4s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
        "glow": "glow 2s ease-in-out infinite",
        "pulse-yellow": "pulseYellow 2s ease-in-out infinite",
      },
      keyframes: {
        slideUp: {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        glow: {
          "0%,100%": { boxShadow: "0 0 10px rgba(245,197,24,0.2)" },
          "50%": { boxShadow: "0 0 25px rgba(245,197,24,0.5)" },
        },
        pulseYellow: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
