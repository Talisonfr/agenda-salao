import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          50: "#FAF2F3",
          100: "#F4E7E8",
          200: "#E7C7CA",
          300: "#D49A9A",
          400: "#C5838E",
          500: "#B76E79", // Rosé Gold Primário
          600: "#9F5863",
          700: "#8F4D57",
          800: "#753F47",
          900: "#5F333A",
        },
        charcoal: {
          50: "#F7F6F8",  // Fundo limpo
          100: "#EFECEF", // Cards elevados
          200: "#E5E0E2", // Bordas sutis
          300: "#C7C4C8",
          400: "#8D8A90",
          500: "#5E5C63",
          600: "#3D3B43",
          700: "#2B2B33", // Elementos de contraste elevado
          800: "#1E1E24", // Textos principais
          900: "#131317",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "sans-serif"],
        serif: ["var(--font-serif)", "Playfair Display", "Cormorant Garamond", "serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(30, 30, 36, 0.05)",
        luxury: "0 10px 30px -4px rgba(183, 110, 121, 0.12)",
        bottomNav: "0 -4px 16px rgba(30, 30, 36, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
