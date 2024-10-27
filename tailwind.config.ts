import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Satoshi"],
        mono: ["Inter Tight"],
        intergral: ["Inter Tight"],
        black: ["Inter Tight"],
        normal: ["Satoshi"],
        light: ["Satoshi"],
        bold: ["Inter Tight"],
        serif: ["Inter Tight"],
        medium: ["Inter Tight"],
        regular: ["Satoshi"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  daisyui: {
    themes: [
      {
        okapilight: {
          "primary": "#8D6E63",     // Light brown
          "secondary": "#A5D6A7",   // Light green
          "accent": "#66BB6A",      // Medium green
          "neutral": "#5D4037",     // Dark brown
          "base-100": "#FAFAFA",    // Paper white
          "info": "#4DD0E1",        // Light blue
          "success": "#81C784",     // Light green
          "warning": "#FFD54F",     // Light yellow
          "error": "#E57373",       // Light red
        },
      },
      {
        okapidark: {
          "primary": "#D7CCC8",     // Very light brown
          "secondary": "#81C784",   // Medium green
          "accent": "#4CAF50",      // Darker green
          "neutral": "#ECEFF1",     // Very light grey
          "base-100": "#3E2723",    // Very dark brown
          "info": "#4DD0E1",        // Light blue
          "success": "#66BB6A",     // Medium green
          "warning": "#FFA726",     // Orange
          "error": "#EF5350",       // Bright red
        },
      },
    ],
  },
  plugins: [require('daisyui')],
};
export default config;
