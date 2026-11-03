import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "Inter Tight",
          "Inter",
          "-apple-system",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        border: "var(--color-line)",
        input: "var(--color-line)",
        ring: "var(--color-ink)",
        background: "var(--color-paper)",
        foreground: "var(--color-ink)",
        
        // Queenstown Labs Core Studio Tokens
        ink: {
          DEFAULT: "var(--color-ink)",
          soft: "var(--color-ink-soft)",
        },
        paper: "var(--color-paper)",
        wash: {
          DEFAULT: "var(--color-wash)",
          subtle: "#f5f5f5",
        },
        line: {
          DEFAULT: "var(--color-line)",
          strong: "var(--color-line-strong)",
        },
        faint: "var(--color-faint)",
        
        primary: {
          DEFAULT: "var(--color-ink)",
          foreground: "var(--color-paper)",
        },
        secondary: {
          DEFAULT: "var(--color-wash)",
          foreground: "var(--color-ink)",
        },
        destructive: {
          DEFAULT: "#e11d48",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "var(--color-wash)",
          foreground: "var(--color-muted)",
        },
        accent: {
          DEFAULT: "#10b981",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "var(--color-paper)",
          foreground: "var(--color-ink)",
        },
        card: {
          DEFAULT: "var(--color-paper)",
          foreground: "var(--color-ink)",
        },
        brand: {
          green: "#10b981",
          greenHover: "#059669",
          dark: "#111111",
          muted: "#666666",
        },
      },
      borderRadius: {
        "3xl": "1.5rem",
        "2xl": "1rem",
        xl: "0.75rem",
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      boxShadow: {
        glass: "inset 0 1px 0 0 rgba(255, 255, 255, 0.7), 0 0 0 1px rgba(17, 17, 17, 0.07), 0 1px 2px rgba(17, 17, 17, 0.04), 0 10px 30px -10px rgba(17, 17, 17, 0.08)",
        subtle: "0 1px 2px 0 rgba(17, 17, 17, 0.04)",
        card: "0 1px 3px 0 rgba(17, 17, 17, 0.04), 0 1px 2px -1px rgba(17, 17, 17, 0.04)",
        lifted: "0 12px 32px -8px rgba(17, 17, 17, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
