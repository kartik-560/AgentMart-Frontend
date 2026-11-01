/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        royal: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        cream: {
          50: "#fffdf9",
          100: "#faf7ee",
          200: "#f4efe3",
          300: "#ebe2cf",
          400: "#ded0b5",
          500: "#cdba96",
          600: "#b59e75",
          700: "#947f5a",
          800: "#756345",
          900: "#5c4d36",
          950: "#362c1e",
        },
      },
    },
  },
  plugins: [],
};
