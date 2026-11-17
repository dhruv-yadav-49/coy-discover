import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8F9FC",
        foreground: "#111827",
        primary: {
          DEFAULT: "#6D28D9",
          hover: "#5B21B6",
          light: "#EDE9FE",
        },
        coy: {
          purple: "#7C3AED",
          violet: "#6D28D9",
          pink: "#EC4899",
          coral: "#F43F5E",
          emerald: "#10B981",
          slate: "#334155",
          muted: "#94A3B8",
          card: "#FFFFFF",
          bg: "#F8FAFC",
        },
      },
      boxShadow: {
        card: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
        cardHover: "0 20px 35px -5px rgba(109, 40, 217, 0.12), 0 10px 15px -6px rgba(0, 0, 0, 0.05)",
        floating: "0 12px 30px -4px rgba(109, 40, 217, 0.25)",
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
