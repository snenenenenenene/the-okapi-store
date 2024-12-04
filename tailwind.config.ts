import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sand: {
          DEFAULT: '#D2C6BB',
          50: '#FAF8F7',
          100: '#F2EFED',
          200: '#E8E3DF',
          300: '#DED7D1',
          400: '#D4CBC3',
          500: '#C0B3A7',
          600: '#AC9B8B',
          700: '#98836F',
          800: '#7D6B59',
          900: '#625343',
        },
        sandstone: {
          50: '#faf9f7',
          100: '#f5f3ef',
          200: '#e8e4db',
          300: '#d5cdc0',
          400: '#bbb0a1',
          500: '#a69886',
          600: '#8c7e6d',
          700: '#746859',
          800: '#5f564a',
          900: '#4d463e',
        },
        vintage: {
          black: "#1A1A1A",
          white: "#F5F5F5",
          grey: '#4A4A4A',
          wash: '#D4D4D4',
        },
        grey: {
          50: "#F9F9F9",
          100: "#EFEFEF",
          200: "#DFDFDF",
          300: "#CFCFCF",
          400: "#BFBFBF",
          500: "#AFAFAF",
          600: "#9F9F9F",
          700: "#8F8F8F",
          800: "#7F7F7F",
          900: "#6F6F6F"
        }
      },
      fontFamily: {
        satoshi: ["Satoshi"],
        inter: ["Inter Tight"],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
        intergral: ["Inter Tight"],
        black: ["Inter Tight"],
        normal: ["Satoshi"],
        light: ["Satoshi"],
        bold: ["Inter Tight"],
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        medium: ["Inter Tight"],
        regular: ["Satoshi"],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
        'slide-down': 'slideDown 0.5s ease-in-out',
        'slide-in-from-top-2': 'slide-in-from-top 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'slide-in-from-top': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      }
    },
  },
  daisyui: {
    themes: [
      {
        okapilight: {
          primary: "#8D6E63",
          secondary: "#A5D6A7",
          accent: "#66BB6A",
          neutral: "#5D4037",
          "base-100": "#FAFAFA",
          info: "#4DD0E1",
          success: "#81C784",
          warning: "#FFD54F",
          error: "#E57373",
        },
      },
      {
        okapidark: {
          primary: "#D7CCC8",
          secondary: "#81C784",
          accent: "#4CAF50",
          neutral: "#ECEFF1",
          "base-100": "#263238",
          info: "#26C6DA",
          success: "#66BB6A",
          warning: "#FFC107",
          error: "#EF5350",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};

export default config;
