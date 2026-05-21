import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-light": "rgb(var(--color-primary-light) / <alpha-value>)",
        "bg-base": "rgb(var(--color-bg-base) / <alpha-value>)",
        "bg-secondary": "rgb(var(--color-bg-secondary) / <alpha-value>)",
        "brown-dark": "rgb(var(--color-brown-dark) / <alpha-value>)",
        "brown-mid": "rgb(var(--color-brown-mid) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
      },
      fontFamily: {
        heading: "var(--font-heading)",
        body: "var(--font-body)",
      },
      boxShadow: {
        soft: "0 18px 45px rgb(61 40 23 / 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
