import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        'tooltip': '0 0 32px 24px rgba(20, 19, 22, 0.50)'
      },
      backgroundImage: {
        'account-card-pattern': "url('/account-bg.svg')",
        'drag-and-drop-dashed-pattern': "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='8' ry='8' stroke='%2370C59EFF' stroke-width='1' stroke-dasharray='8' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")"
      },
      keyframes: {
        orbit: {
          '0%': {transform: "rotate(0deg)"},
          '80%, 100%': {transform: "rotate(360deg)"}
        }
      },
      animation: {
        orbit: "orbit ease-in-out 1.5s infinite"
      },
      gridTemplateRows: {
        layout: "auto 1fr auto"
      }
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',

      'primary-bg': "#141316",
      'secondary-bg': "#1D1C1E",
      'tertiary-bg': "#272727",

      'green': '#70C59E',
      'red': "#DC4141",
      'orange': "#D9A251",
      'blue': "#64B2EA",
      'black': '#000000',
      'white': "#FFFFFF",
      'purple': "#A380DC",


      'green-bg': "#1A2B23",
      'red-bg': "#2B1717",
      'orange-bg': "#292115",
      'blue-bg': "#14222B",

      'global-bg': "#121312",

      'green-hover': "#6FF8B8",
      'red-hover': "#E62A2A",
      'purple-hover': "#7552D7",
      'blue-hover': "#D27E1A",
      'orange-hover': "",
      'white-hover': "rgba(255, 255, 255, 0.1)",
      'tertiary-hover': "#3A3A3A",

      'primary-text': "#F5FFF9",
      'secondary-text': '#B2B2B2',
      'placeholder-text': '#7F7F7F',

      'primary-border': '#5A5A5A',
      'secondary-border': '#393939',
      'hover-border': '#848484',
    },
    spacing: {
      '0': '0px',
      '0.5': "2px",
      '1': '4px',
      '1.5': '6px',
      '2': '8px',
      '2.5': "10px",
      '3': '12px',
      '3.5': '14px',
      '4': '16px',
      '5': '20px',
      '5.5': '22px',
      '6': '24px',
      '7': '28px',
      '8': '32px',
      '9': '36px',
      '10': '40px',
      '11': '44px',
      '12': '48px'
    },
    borderRadius: {
      '0': '0px',
      '1': '4px',
      '2': '8px',
      '3': '12px',
      '4': '16px',
      '5': '20px',
      'full': '50%'
    },
    fontSize: {
      12: ['12px', '16px'],
      14: ['14px', '20px'],
      16: ['16px', '24px'],
      18: ['18px', '28px'],
      20: ['20px', '32px'],
      24: ['24px', '40px'],
      32: ['32px', '48px']
    }
  },
  plugins: [],
}
export default config
