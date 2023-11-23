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
      },
      keyframes: {
        orbit: {
          '0%': {transform: "rotate(0deg)"},
          '80%, 100%': {transform: "rotate(360deg)"}
        }
      },
      animation: {
        orbit: "orbit ease-in-out 1.5s infinite"
      }
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      'green': '#3BD171',
      'red': "#D13B3B",
      'orange': "#D38932",
      'blue': "#22AEFC",
      'black': '#000000',
      'white': "#FFFFFF",

      'primary-bg': "#121312",
      'green-bg': "#0F1E15",
      'red-bg': "#1A0D0A",
      'orange-bg': "#1F170A",
      'blue-bg': "#0F1929",

      'green-hover': "#2DBF61",

      'font-primary': "#F5FFF9", // text-font-primary
      'font-secondary': '#B2B2B2',
      'placeholder': '#7F7F7F',

      'primary-border': '#5A5A5A', // border-primary-border
      'disabled-border': '#393939',
      'hover-border': '#848484',

      'block-fill': "#141316",
      'table-fill': "#272727",
      'input-fill': "#1D1C1E"
    },
    spacing: {
      '0': '0px',
      '0.5': "2px",
      '1': '4px',
      '1.5': '6px',
      '2': '8px',
      '2.5': "10px",
      '3': '12px',
      '4': '16px',
      '5': '20px',
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
