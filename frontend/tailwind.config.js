/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#0a0f0d",
          900: "#0f1713",
          800: "#141f1a",
          700: "#1c2b24",
        },
        mint: {
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        glass: "rgba(255,255,255,0.04)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0,0,0,0.37)",
        glow: "0 0 24px 0 rgba(34,197,94,0.25)",
      },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [],
}
