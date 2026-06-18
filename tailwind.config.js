const { heroui } = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        "display-lg": ["var(--font-public-sans)"],
        "headline-md": ["var(--font-public-sans)"],
        "display-lg-mobile": ["var(--font-public-sans)"],
        "headline-sm": ["var(--font-public-sans)"],
        "body-md": ["var(--font-public-sans)"],
        "body-lg": ["var(--font-public-sans)"],
        "label-sm": ["var(--font-sans)"],
        "label-md": ["var(--font-sans)"],
      },
      colors: {
        "on-secondary-fixed-variant": "#005236",
        "inverse-surface": "#213145",
        "outline-variant": "#c6c6cd",
        "error-container": "#ffdad6",
        "tertiary-container": "#2a1700",
        "on-secondary-fixed": "#002113",
        "on-tertiary-container": "#b87500",
        "on-primary": "#ffffff",
        "primary-fixed": "#dae2fd",
        "surface-tint": "#565e74",
        "on-secondary-container": "#00714d",
        "on-background": "#0b1c30",
        "surface-variant": "#d3e4fe",
        "on-tertiary": "#ffffff",
        "inverse-on-surface": "#eaf1ff",
        "on-surface-variant": "#45464d",
        "primary": "#000000",
        "surface-container-lowest": "#ffffff",
        "tertiary-fixed": "#ffddb8",
        "on-error": "#ffffff",
        "on-surface": "#0b1c30",
        "on-tertiary-fixed": "#2a1700",
        "surface-container": "#e5eeff",
        "background": "#f8f9ff",
        "surface-container-low": "#eff4ff",
        "secondary-container": "#6cf8bb",
        "primary-container": "#131b2e",
        "on-error-container": "#93000a",
        "on-primary-fixed-variant": "#3f465c",
        "on-tertiary-fixed-variant": "#653e00",
        "surface": "#f8f9ff",
        "secondary-fixed-dim": "#4edea3",
        "on-secondary": "#ffffff",
        "error": "#ba1a1a",
        "surface-bright": "#f8f9ff",
        "tertiary-fixed-dim": "#ffb95f",
        "outline": "#76777d",
        "on-primary-fixed": "#131b2e",
        "on-primary-container": "#7c839b",
        "surface-container-high": "#dce9ff",
        "primary-fixed-dim": "#bec6e0",
        "secondary-fixed": "#6ffbbe",
        "surface-dim": "#cbdbf5",
        "tertiary": "#000000",
        "secondary": "#006c49",
        "inverse-primary": "#bec6e0",
        "surface-container-highest": "#d3e4fe",
      },
      spacing: {
        "xs": "4px",
        "md": "16px",
        "base": "4px",
        "lg": "24px",
        "margin-desktop": "80px",
        "sm": "8px",
        "gutter": "24px",
        "xl": "40px",
        "max-width": "1280px",
        "margin-mobile": "16px",
      },
      fontSize: {
        "display-lg": [
          "48px",
          {
            "lineHeight": "56px",
            "letterSpacing": "-0.02em",
            "fontWeight": "700"
          }
        ],
        "headline-md": [
          "24px",
          {
            "lineHeight": "32px",
            "fontWeight": "600"
          }
        ],
        "display-lg-mobile": [
          "32px",
          {
            "lineHeight": "40px",
            "letterSpacing": "-0.02em",
            "fontWeight": "700"
          }
        ],
        "headline-sm": [
          "20px",
          {
            "lineHeight": "28px",
            "fontWeight": "600"
          }
        ],
        "body-md": [
          "16px",
          {
            "lineHeight": "24px",
            "fontWeight": "400"
          }
        ],
        "body-lg": [
          "18px",
          {
            "lineHeight": "28px",
            "fontWeight": "400"
          }
        ],
        "label-sm": [
          "12px",
          {
            "lineHeight": "16px",
            "fontWeight": "600"
          }
        ],
        "label-md": [
          "14px",
          {
            "lineHeight": "20px",
            "fontWeight": "500"
          }
        ]
      }
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};

module.exports = config;
