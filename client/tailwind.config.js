/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        darkbg: "#0f172a",
        card: "#1e293b",
      },
    },
  },
  plugins: [],
};