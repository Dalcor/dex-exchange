import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        tooltip: "0 0 32px 24px rgba(20, 19, 22, 0.50)",
        select: "0 0 10px 0 #8EFFCB99",
        checkbox: "0 0 8px 0 #B3FFE2CC",
        popup: "0 4px 42px 0px #000000E6",
        error: "0px 0px 10px 0px #D13B3B99",
        warning: "0px 0px 10px 0px #D9A25199",
      },
      backgroundImage: {
        "account-card-pattern": "url('/account-bg.svg')",
        "drag-and-drop-dashed-pattern":
          "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='8' ry='8' stroke='%2370C59EFF' stroke-width='1' stroke-dasharray='8' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")",
        "standard-gradient": "linear-gradient(90deg, #3C4C4A 0%, #0F0F0F 100%)",
        "footer-border":
          "linear-gradient(90deg, rgba(56, 59, 58, 0.2) 0%, #383B3A 50%, rgba(56, 59, 58, 0.2) 100%)",
        "swap-radio-right": "linear-gradient(90deg, #0F0F0F 0%, #1D1E1E 100%)",
        "swap-radio-left": "linear-gradient(270deg, #0F0F0F 0%, #1D1E1E 100%)",
        "navigation-active":
          "linear-gradient(180deg, #0B0B0B -6.77%, #283631 87.04%, #70C59E 100%)",
        "navigation-hover": "linear-gradient(180deg, #0F0F0F -6.77%, #3B4E47 100%);",
      },
      keyframes: {
        orbit: {
          "0%": { transform: "rotate(0deg)" },
          "80%, 100%": { transform: "rotate(360deg)" },
        },
        swap: {
          "0%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(-90deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        flicker1: {
          "0%": { opacity: "0.3" },
          "25%": { opacity: "1" },
          "50%, 100%": { opacity: "0.3" },
        },
        flicker2: {
          "0%, 25%": { opacity: "0.3" },
          "50%": { opacity: "1" },
          "75%, 100%": { opacity: "0.3" },
        },
        flicker3: {
          "0%, 50%": { opacity: "0.3" },
          "75%": { opacity: "1" },
          "100%": { opacity: "0.3" },
        },
      },
      animation: {
        orbit: "orbit ease-in-out 1.5s infinite",
        swap: "swap ease-in-out 0.5s",
        flicker1: "flicker1 ease-in 1.5s infinite",
        flicker2: "flicker2 ease-in 1.5s infinite",
        flicker3: "flicker3 ease-in 1.5s infinite",
      },
      gridTemplateRows: {
        layout: "auto 1fr auto",
      },
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",

      "primary-bg": "#1D1E1E", // changed
      "secondary-bg": "#0F0F0F", // changed
      "tertiary-bg": "#272727", // changed
      "quaternary-bg": "#2E2F2F", // changed

      green: "#70C59E", // changed
      green_opacity_20: "#70C59E33", // changed
      red: "#D24B4B", // changed
      orange: "#D9A251", // changed
      blue: "#64B2EA", // changed
      black: "#000000", // changed
      white: "#FFFFFF", // changed
      purple: "#A380DC", // changed

      "green-bg": "#3C4C4A", // changed
      "red-bg": "#443535", // changed
      "orange-bg": "#4A4237", // changed
      "blue-bg": "#2A3A45", // changed
      "purple-bg": "#3E3851", // changed

      "global-bg": "#121312", // changed

      "green-hover": "#6FF8B8", // changed
      "red-hover": "#E83737", // changed
      "purple-hover": "#7552D7", // changed
      "blue-hover": "#D27E1A", // changed
      "orange-hover": "#D27E1A", // changed
      "white-hover": "rgba(255, 255, 255, 0.1)", // changed
      "tertiary-hover": "#3A3A3A", // changed

      "primary-text": "#F5FFF9", // changed
      "secondary-text": "#BCC3C2", // changed
      "tertiary-text": "#798180", // changed

      "primary-border": "#5A5A5A", // changed
      "secondary-border": "#383C3A", // changed
      "tertiary-border": "#2A2D2C", // changed
      "hover-border": "#7E8281", // changed
    },
    spacing: {
      "0": "0px",
      px: "1px",
      "0.5": "2px",
      "1": "4px",
      "1.5": "6px",
      "2": "8px",
      "2.5": "10px",
      "3": "12px",
      "3.5": "14px",
      "4": "16px",
      "5": "20px",
      "5.5": "22px",
      "6": "24px",
      "7": "28px",
      "8": "32px",
      "9": "36px",
      "10": "40px",
      "11": "44px",
      "12": "48px",
    },
    borderRadius: {
      "0": "0px",
      "1": "4px",
      "2": "8px",
      "3": "12px",
      "4": "16px",
      "5": "20px",
      "20": "80px",
      full: "50%",
    },
    fontSize: {
      8: ["8px", "12px"],
      10: ["10px", "14px"],
      12: ["12px", "16px"],
      14: ["14px", "20px"],
      16: ["16px", "24px"],
      18: ["18px", "28px"],
      20: ["20px", "32px"],
      24: ["24px", "40px"],
      32: ["32px", "48px"],
    },
  },
  plugins: [
    require("@tailwindcss/container-queries"),
    require("@savvywombat/tailwindcss-grid-areas"),
  ],
};
export default config;
