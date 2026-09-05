/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0a1330",
          900: "#0f1c3f",
          800: "#152a5c",
          700: "#1c3775",
        },
        royal: {
          600: "#2952e3",
          500: "#3b63f0",
          400: "#5c7cf5",
        },
        indigo2: {
          600: "#4338ca",
          500: "#4f46e5",
        },
        surface: {
          bg: "#f5f7fb",
          card: "#ffffff",
          border: "#e5e9f2",
        },
        status: {
          approved: "#16a34a",
          approvedBg: "#ecfdf3",
          rejected: "#dc2626",
          rejectedBg: "#fef2f2",
          info: "#d97706",
          infoBg: "#fffbeb",
          escalated: "#7c3aed",
          escalatedBg: "#f5f3ff",
          review: "#2563eb",
          reviewBg: "#eff6ff",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 64, 0.04), 0 1px 8px rgba(16, 24, 64, 0.06)",
        cardHover: "0 4px 16px rgba(16, 24, 64, 0.10)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};
