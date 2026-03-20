import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEFBF3",
          100: "#D6F5E3",
          200: "#B0EACB",
          300: "#7DDAAD",
          400: "#47C48A",
          500: "#22A86A",
          600: "#1A7F4B",
          700: "#166A40",
          800: "#145434",
          900: "#0B3D2C",
          950: "#052319",
        },
        surface: {
          DEFAULT: "#F7F6F3",
          warm: "#FBF9F6",
          card: "#FFFFFF",
          elevated: "#FFFFFF",
        },
        ink: {
          DEFAULT: "#1C1917",
          secondary: "#78716C",
          tertiary: "#A8A29E",
          faint: "#D6D3D1",
        },
        accent: {
          orange: "#F97316",
          coral: "#FB7185",
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(28,25,23,0.04), 0 6px 24px rgba(28,25,23,0.06)",
        "card-hover": "0 2px 8px rgba(28,25,23,0.06), 0 12px 32px rgba(28,25,23,0.1)",
        elevated: "0 4px 12px rgba(28,25,23,0.08), 0 20px 48px rgba(28,25,23,0.12)",
        glow: "0 0 0 3px rgba(34,168,106,0.2)",
        "bottom-bar": "0 -4px 24px rgba(28,25,23,0.08)",
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "fade-up": "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-up-1": "fadeUp 0.4s 0.06s cubic-bezier(0.16,1,0.3,1) both",
        "fade-up-2": "fadeUp 0.4s 0.12s cubic-bezier(0.16,1,0.3,1) both",
        "fade-up-3": "fadeUp 0.4s 0.18s cubic-bezier(0.16,1,0.3,1) both",
        "slide-up": "slideUp 0.32s cubic-bezier(0.16,1,0.3,1) forwards",
        "scale-in": "scaleIn 0.2s ease-out forwards",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
