/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#f6f7fb",
        card: "#ffffff",
        brand: { 600: "#1B59F8", 700: "#174bd3" },
      },
    },
  },
  plugins: [],
};
