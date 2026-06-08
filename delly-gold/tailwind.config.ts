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
        gold: {
          50: "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#facc15",
          500: "#d4af37",
          600: "#b8962e",
          700: "#c9a227",
          800: "#a07d1c",
          900: "#7c5c0e",
        },
        dark: {
          50: "#2a2a2a",
          100: "#1f1f1f",
          200: "#1a1a1a",
          300: "#161616",
          400: "#121212",
          500: "#0e0e0e",
          600: "#0a0a0a",
          700: "#080808",
          800: "#050505",
          900: "#000000",
        },
      },
      fontFamily: {
        vazir: ["Vazirmatn", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
