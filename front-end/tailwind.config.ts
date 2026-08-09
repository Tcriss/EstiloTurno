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
        // Primary palette
        primary: "#006a66",
        "primary-container": "#38b2ac",
        "on-primary": "#ffffff",
        "on-primary-container": "#003f3d",
        "inverse-primary": "#66d8d2",
        "primary-fixed": "#84f5ee",
        "primary-fixed-dim": "#66d8d2",
        "on-primary-fixed": "#00201e",
        "on-primary-fixed-variant": "#00504d",
        // Secondary palette
        "secondary-color": "#516071",
        "on-secondary": "#ffffff",
        "secondary-container": "#d2e1f6",
        "on-secondary-container": "#566476",
        "secondary-fixed": "#d5e4f9",
        "secondary-fixed-dim": "#b9c8dc",
        "on-secondary-fixed": "#0e1d2c",
        "on-secondary-fixed-variant": "#3a4859",
        // Tertiary palette
        tertiary: "#494bd6",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#9497ff",
        "on-tertiary-container": "#1b14b1",
        "tertiary-fixed": "#e1e0ff",
        "tertiary-fixed-dim": "#c0c1ff",
        "on-tertiary-fixed": "#07006c",
        "on-tertiary-fixed-variant": "#2f2ebe",
        // Error palette
        "error-color": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        // Surface & background
        background: "#f7fafc",
        "on-background": "#181c1e",
        surface: "#f7fafc",
        "surface-dim": "#d7dadc",
        "surface-bright": "#f7fafc",
        "surface-variant": "#e0e3e5",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f1f4f6",
        "surface-container": "#ebeef0",
        "surface-container-high": "#e5e9eb",
        "surface-container-highest": "#e0e3e5",
        "on-surface": "#181c1e",
        "on-surface-variant": "#3d4948",
        "inverse-surface": "#2d3133",
        "inverse-on-surface": "#eef1f3",
        outline: "#6d7a78",
        "outline-variant": "#bcc9c7",
        "surface-tint": "#006a66",
        // Brand tokens
        "slate-dark": "#0F172A",
        "border-subtle": "#E2E8F0",
        "text-main": "#2D3748",
        "text-muted": "#718096",
        // Legacy aliases (kept for backwards compat with existing auth components)
        navy: "#1F2D3D",
        teal: "#38B2AC",
        "blue-gray": "#9FB7C1",
        mist: "#E2E8F0",
      },
      boxShadow: {
        soft: "0 22px 70px rgba(31, 45, 61, 0.12)",
        panel: "0 16px 46px rgba(31, 45, 61, 0.10)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        login: "0 8px 24px rgba(0, 106, 102, 0.16)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        geist: ["var(--font-geist)", "Geist", "Inter", "sans-serif"],
        heading: ["var(--font-geist)", "Geist", "Inter", "Segoe UI", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      spacing: {
        gutter: "24px",
        "sidebar-width": "260px",
        "container-max": "1440px",
      },
    },
  },
  plugins: [],
};

export default config;
