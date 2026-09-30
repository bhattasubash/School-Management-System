import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--brand-primary, #C2410C)",
          primary: "var(--brand-primary, #C2410C)",
          hover: "var(--brand-primary-hover, #9A3412)",
          light: "var(--brand-primary-light, #FFEDD5)",
          text: "var(--brand-primary-text, #FFFFFF)",
          dark: "var(--brand-dark, #0F172A)",
          navy: "#0F172A",
          canvas: "var(--brand-canvas, #FFFFFF)",
          subtle: "var(--brand-subtle, #F8FAFC)",
          muted: "var(--brand-muted, #64748B)",
          border: "var(--brand-border, #E2E8F0)",
        },
        platform: {
          primary: "#4338CA",
          hover: "#3730A3",
          light: "#EEF2FF",
        },
        semantic: {
          success: "#16A34A",
          warning: "#D97706",
          danger: "#DC2626",
          info: "#2563EB",
          border: "#E2E8F0",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "Helvetica", "Arial", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "8px",
        lg: "8px",
        xl: "12px",
        "2xl": "12px",
        card: "12px",
        tile: "8px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(15, 23, 42, 0.05)",
        card: "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.06)",
        "card-hover": "0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)",
      },
      fontSize: {
        display: ["1.75rem", { lineHeight: "2.25rem", letterSpacing: "-0.01em", fontWeight: "700" }],
        "section-header": ["1.125rem", { lineHeight: "1.5rem", letterSpacing: "0", fontWeight: "600" }],
        "body-primary": ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0", fontWeight: "500" }],
        caption: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.01em", fontWeight: "500" }],
        badge: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.02em", fontWeight: "600" }],
      },
    },
  },
  plugins: [],
} satisfies Config;
