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
          accent: "#FF856A",              // Primary Coral (#FF856A)
          coral: "#FF856A",               // Primary Coral
          coralLight: "#FFF5F2",          // Pale coral tint
          dark: "#132033",                // Deep Navy Slate (#132033)
          navy: "#132033",                // Deep Navy
          canvas: "#FFFFFF",              // Pure White
          subtle: "#F3F7FA",              // Pale cool blue-grey background (#F3F7FA)
          muted: "#6F7D8D",               // Secondary neutral text (#6F7D8D)
          border: "#E6ECF1",              // Thin card border (#E6ECF1)
          green: "#39C98A",               // Attendance / Success Emerald (#39C98A)
          cyan: "#35C1E8",                // Decorative corner accent (#35C1E8)
        },
        semantic: {
          success: "#39C98A",             // Emerald Green
          warning: "#F59E0B",             // Amber
          border: "#E6ECF1",              // Card borders (#E6ECF1)
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "Helvetica", "Arial", "sans-serif"],
      },
      borderRadius: {
        card: "18px",                     // Outer card radius
        tile: "14px",                     // Inner element radius
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(17, 28, 45, 0.05)",
        "card-hover": "0 10px 25px -4px rgba(17, 28, 45, 0.08)",
      },
      fontSize: {
        display: ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.02em", fontWeight: "700" }],
        "section-header": ["1.125rem", { lineHeight: "1.625rem", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-primary": ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0", fontWeight: "500" }],
        caption: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.01em", fontWeight: "400" }],
        badge: ["0.6875rem", { lineHeight: "0.875rem", letterSpacing: "0.02em", fontWeight: "600" }],
      },
    },
  },
  plugins: [],
} satisfies Config;
